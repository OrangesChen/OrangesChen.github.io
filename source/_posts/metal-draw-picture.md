---
title: Metal图片渲染
date: 2018-05-09 
tags:
    - Metal
    - iOS
---
本章内容主要是在上一篇【绘制三角形】的基础上添加了图片渲染的功能，分别说明了使用Metal和MetalKit中创建纹理的方法。

###### 1、首先修改Metal shader的着色里的内容

* 添加顶点输入和输出的结构体

```Shader
// 输入的顶点和纹理坐标
   struct VertexIn
 {
     packed_float3 position;
     packed_float2 st;
 };
// 输出顶点和纹理坐标，因为需要渲染纹理，可以不用输入顶点颜色
 struct VertexOut
 {
    float4 position [[position]];
    float2 st;
 };
```
<!--more-->
* 顶点函数和片段函数内容

```Shader
// 添加纹理顶点坐标
vertex VertexOut texture_vertex(uint vid[[vertex_id]], const device VertexIn *vertex_array[[buffer(0)]])
{
    VertexOut outVertex;
    VertexIn vertexIn = vertex_array[vid];
    outVertex.position = float4(vertexIn.position, 1.0);
    outVertex.st = vertexIn.st;
//    outVertex.color = color[vid];
    return outVertex;
};
fragment float4 texture_fragment(VertextInOut inFrag[[stage_in]], texture2d<float> texas[[texture(0)]])
{
    constexpr sampler defaultSampler;
    float4 rgba = texas.sample(defaultSampler, inFrag.st).rgba;
    return rgba;
};
```

###### 2、加载图片创建Metal纹理

* Metal Framework中在处理贴图上使用`CGImage`在`CGContext`上`draw`的方法来取得图像, 但是通过`draw`方法绘制的图像是上下颠倒的。
* 首先要说的是，在iOS的不同framework中使用着不同的坐标系：

> UIKit － y轴向下
 Core Graphics(Quartz) － y轴向上
 OpenGL ES － y轴向上
 UIKit是iPhone SDK的Cocoa Touch层的核心framework，是iPhone应用程序图形界面和事件驱动的基础，它和传统windows桌面一样，坐标系是y轴向下的; Core Graphics(Quartz)一个基于2D的图形绘制引擎，它的坐标系则是y轴向上的；而OpenGL ES是iPhone SDK的2D和3D绘制引擎，它使用左手坐标系，它的坐标系也是y轴向上的，如果不考虑z轴，在 二维下它的坐标系和Quartz是一样的。

### `注：不知道是不是API更新等原因，有小伙伴说图片倒置的问题还是存在，经过测试，发现CGContextDrawImage绘制的图片已经不需要处理倒置的问题了，具体原因还有待证实，或者说我这些观点有误的话希望有人能详细指出`

>`以下内容可以忽略😆`
当通过CGContextDrawImage绘制图片到一个context中时，如果传入的是UIImage的CGImageRef，因为UIKit和CG坐标系y轴相反，所以图片绘制将会上下颠倒。解决方法有以下几种，
解决方法一：在绘制到context前通过矩阵垂直翻转坐标系
解决方法二：使用UIImage的drawInRect函数，该函数内部能自动处理图片的正确方向
解决方法三：垂直翻转投影矩阵,这种方法通过设置上下颠倒的投影矩阵，使得原本y轴向上的GL坐标系看起来变成了y轴向下，并且坐标原点从屏幕左下角移到了屏幕左上角。如果你习惯使用y轴向下的坐标系进行二维操作，可以使用这种方法，同时原本颠倒的图片经过再次颠倒后回到了正确的方向：
  本人能力有限，对于我来说矩阵的处理还是有难度的，所以选择第二种相对简单一些的方法来解决图片上下颠倒的问题。

* 新建Swift文件，引入头文件

```Swift
import Metal
import UIKit
import CoreGraphics
```

* 添加图片加载方法，调用`makeTexture()`方法生成纹理

```Swift
var type: MTLTextureType!
var texture: MTLTexture!
// 在处理贴图上使用CGImage在CGContext上draw的方法来取得图像, 但是通过draw方法绘制的图像是上下颠倒的，可以通过UIImage的drawInRect函数，该函数内部能自动处理图片的正确方向，生成纹理
func loadIntoTextureWithDevice(device: MTLDevice, name: String, ext: String) -> Bool {
    
    let path = Bundle.main.path(forResource: name, ofType: ext)
    if !(path != nil) {
        return false
    }
    let image = UIImage(contentsOfFile: path!)
    let width = (image?.cgImage)!.width
    let height = (image?.cgImage)!.height
    let dataSize = width * height * 4
    let data = UnsafeMutablePointer<UInt8>.allocate(capacity: dataSize)
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let context = CGContext(data: data, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 4 * width, space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue);
    context?.draw((image?.cgImage)!, in: CGRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height)))
    // 通过UIImage的drawInRect函数，该函数内部能自动处理图片的正确方向 
   // 不知道是不是API更新了 已经不需要这一步处理图片方向了 
   // UIGraphicsPushContext(context!);
   // image?.draw(in: CGRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height)))
    let textDes = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: .rgba8Unorm, width: Int(width), height: Int(height), mipmapped: false)
    type = textDes.textureType
    texture = device.makeTexture(descriptor: textDes)
    if !(texture != nil) {
        return false
    }
    texture.replace(region: MTLRegionMake2D(0, 0, Int(width), Int(height)), mipmapLevel: 0, withBytes: context!.data!, bytesPerRow: width * 4)
   // UIGraphicsPopContext()
    free(data)
    return true
}
```

* MetalKit Framework则直接提供了`MTKTextureLoader`创建纹理
* 引入MetalKit头文件

```Swift
import Foundation
import MetalKit
```

* `MTKTextureLoader`加载图片创建纹理，`MTKTextureLoader`中提供了异步和同步加载的方法

```Swift
enum TextureError: Error {
    case UIImageCreationError
    case MTKTextureLoaderError
}
/*----------创建Metal纹理--------------
 *  @param device 设备
 *  @param name   图片名称
 *  @retun MTLTexture 纹理
 */
func makeTexture(device: MTLDevice, name: String) throws -> MTLTexture {
    guard let image = UIImage(named: name) else {
        throw TextureError.UIImageCreationError
    }
    // 处理后的图片是倒置，要先将其倒置过来才能显示出正图像, 或者修改纹理坐标，将纹理坐标左上角设置为(0,0)，这一步骤可以省略
    let mirrorImage = UIImage(cgImage: (image.cgImage)!, scale: 1, orientation: UIImageOrientation.downMirrored)
    let scaledImage = UIImage.scaleToSize(mirrorImage, size: image.size)
    do {
        let textureLoader = MTKTextureLoader(device: device)
        let textureLoaderOption:[String: NSNumber] = [ MTKTextureLoaderOptionSRGB: false]
        
        // 异步加载
        //        try textureLoader.newTexture(with: image.cgImage!, options: textureLoaderOption, completionHandler: { (<#MTLTexture?#>, <#Error?#>) in
        //
        //        })
        // 同步根据图片创建新的Metal纹理
        // Synchronously loads image data and creates a new Metal texturefrom a given bitmap image.
        return try textureLoader.newTexture(with: scaledImage.cgImage!, options: textureLoaderOption)
    }
}
```

```Swift
  // 自定义UIImage的类方法，设置图片大小
extension UIImage {
    class func scaleToSize(_ image: UIImage, size: CGSize)->UIImage {
        UIGraphicsBeginImageContext(size)
        image.draw(in: CGRect(origin: CGPoint.zero, size: size))
        let scaledImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return scaledImage!
    }
```

##### 3、获取纹理坐标，渲染图片

* 之前绘制三角形是使用顶点绘制的，这次使用索引绘制一个四边形。
* 添加纹理属性

```Swift
var quaTexture: MTLTexture! = nil
```

* 添加顶点buffer

```Swift
var indexBuffer: MTLBuffer! = nil
```

* 添加顶点和索引数组

```Swift
    // 3.1 在CPU创建一个浮点数数组，需要通过把它移动到一个MTLBuffer，来发送这些数据到GPU。
    let vertexData:[Float] = [
//         0.0,  1.0, 0.0,
//        -1.0, -1.0, 0.0,
//         1.0, -1.0, 0.0
        //position      s, t
        -0.5, -0.5, 0,  0, 0,
         0.5, -0.5, 0,  1, 0,
         0.5,  0.5, 0,  1, 1,
        -0.5,  0.5, 0,  0, 1,
    ]
    let indices:[Int32] = [
        0, 1, 2,
        0, 2, 3
    ]
```

* 创建一个新的indexBuffer，存放索引数组

```Swift
  // 3.3 在GPU创建一个新的indexBuffer，存放索引数组，从CPU里输送data 
 indexBuffer = device.makeBuffer(bytes: indices, length: indices.count * 4, options: MTLResourceOptions(rawValue: UInt(0)))
 indexBuffer.label = "Indices"
```

* 编译shader

```Swift
 // 6.1 通过调用device.newDefaultLibrary方法获得的MTLibrary对象访问到你项目中的预编译shaders,然后通过名字检索每个shader
 let defaultLibrary = device.newDefaultLibrary()
  let fragmentProgram = defaultLibrary?.makeFunction(name: "texture_fragment")
 let vertextProgram = defaultLibrary?.makeFunction(name: "texture_vertex")
```

* 加载纹理

```Swift
 // 加载纹理
  // 1 使用Metal
   let loaded = loadTntoTextureWithDevice(device: device, name: "lena", ext: "png")
    if !loaded {
            print("Failed to load texture")
        }
    quaTexture = texture
 // 2 使用MetalKit
    do {
   quaTexture = try makeTexture(device: device, name: "lena")
          } catch {
            fatalError("Error: Can not load texture")
         }
```

* 在render方法中配置渲染命令编码器，调用`setFragmentTexture`添加纹理，`drawIndexedPrimitives`根据索引数组绘制图形。

```Swift
 renderEncoder.setFragmentTexture(quaTexture, at: 0)
  // 根据索引画图
 renderEncoder.drawIndexedPrimitives(type: .triangle, indexCount: indices.count, indexType: .uint32, indexBuffer: indexBuffer, indexBufferOffset: 0)
```

* 最终效果图如图所示，对于这些原理的东西了解还不是很深，网上的资料太少，能力有限，只能琢磨一些简单的东西。
![效果图](/assets/img/metal_draw_picture.png)

如果对Metal感兴趣的可以下载[Metal Swift Demo](https://github.com/turner/HelloMetal), GitHub上偶然看到别人写的Demo，里面有纹理和矩阵，ModelIO和MetalKit的结合使用等例子。

最后献上[Demo例子](https://github.com/OrangesChen/Metal)
