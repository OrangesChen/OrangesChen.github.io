---
title: Metal入门（使用Metal画一个三角形）
date: 2018-05-02 
tags:
    - Metal
    - iOS
---
学习使用苹果GPU加速3D绘图的新API:Metal
Metal和OpenGL ES相似，它也是一个底层API，负责和3D绘图硬件交互。它们之间的不同在于，Metal不是跨平台的, `Metal 是用 Objective-C 编 写的，基于 Foundation，使用 GCD 在 CPU 和 GPU 之间保持同步`。与之相反的，它设计的在苹果硬件上运行得极其高效，与OpenGL ES相比，它提供了更快的速度和更低的开销。它是一个GPU上一个简单的封装，所以能够完成几乎所有事情，像在屏幕上渲染一个精灵（sprite）或者是一个3D模型。但你要编写完成这些事情的所有代码。这样麻烦的代价是，你拥有了GPU的力量和控制。
优点：
1、使硬件达到运行效率的峰值：因为Metal非常底层，它允许你使硬件达到运行效率的峰值，对你的游戏如何运行有着完全的控制。
2、这是一个很好的学习经历：学习Metal教导你很多关于3D绘图编程的概念，编写你自己的游戏引擎，以及高层(higher level)游戏框架如何运作。

<!--more-->
关于metal详细的介绍可参考:
![Metal渲染流程图.png](/assets/img/metal_draw_pipeline.png)
#### 以下是使用Metal和Swift来创建一个有基本脉络的应用：画一个简单的三角形。
注意：Metal应用不能跑在iOS模拟器上，它们需要一个设备，设备上装载着苹果A7芯片或者更新的芯片。所以需要一台这样的设备(iPhone 5S,iPad Air,iPad mini2)来完成代码的测试。
打开Xcode 通过iOS\Application\Single View Application template创建一个新的项目。使用TriangleSwift作为项目名称，设置开发语言为Swift，设置设备为通用设备(Universal)。点击Next，选择一个目录，点击Create。
有七个步骤来设置metal：
1    创建一个MTLDevice
2    创建一个CAMetalLayer
3    创建一个Vertex Buffer
4    创建一个Vertex Shader
5    创建一个Fragment Shader
6    创建一个Render Pipeline
7    创建一个Command Queue


##### 1    创建一个MTLDevice
使用Metal你要做的第一件事就是获取一个MTLDevice的引用。
为了完成这点，打开ViewController.swift 并添加下面的import语句
```
import Metal
```
导入了Metal框架，所以你能够使用Metal的类（像这文件中的MTLDevice）。接着，在ViewController类中添加以下属性：
在viewDidLoad函数内初始化这个属性
```
    // 1、创建一个MTLDevice, 你可以把一个MTLDevice想象成是你和CPU的直接连接。你将通过使用MTLDevice创建所有其他你需要的Metal对象（像是command queues，buffers，textures）。
    var device: MTLDevice! = nil
```
##### 2 创建一个CAMetalLayer
在iOS里，你在屏幕上看见的所有东西，被一个CALayer所承载。存在不同特效的CALayer的子类，比如：渐变层(gradient layers)、形状层（shapelayers）、重复层(replicator layers) 等等。如果你想要用Metal在屏幕上画一些东西，你需要使用一个特别的CALayer子类，CAMetalLayer。
因为CAMetalLayer是QuartzCore框架的部分，而不是Metal框架里的，首先在这个文件的上方添加import语句
```
import QuartzCore
```
把新属性添加到类中：
```
    // 2、创建一个CAMetalLayer
    var metalLayer: CAMetalLayer! = nil
```
设置metalLayer
```
        // 2.1 创建CAMetalLayer
        metalLayer = CAMetalLayer()
        // 2.2 必须明确layer使用的MTLDevice，简单地设置早前获取的device
        metalLayer.device = device
        // 2.3 把像素格式（pixel format）设置为BGRA8Unorm，它代表"8字节代表蓝色、绿色、红色和透明度，通过在0到1之间单位化的值来表示"。这次两种用在CAMetalLayer的像素格式之一，一般情况下你这样写就可以了。
        metalLayer.pixelFormat = .bgra8Unorm
        // 2.4 苹果鼓励将framebufferOnly设置为true，来增强表现效率。除非你需要对从layer生成的纹理（textures）取样，或者你需要在layer绘图纹理(drawable textures)激活一些计算内核，否则你不需要设置。（大部分情况下你不用设置）
        metalLayer.framebufferOnly = true
        // 2.5 把layer的frame设置为view的frame
        metalLayer.frame = view.layer.frame
        var drawableSize = self.view.bounds.size
        drawableSize.width *= self.view.contentScaleFactor
        drawableSize.height *= self.view.contentScaleFactor
        metalLayer.drawableSize = drawableSize
        view.layer.addSublayer(metalLayer)
```
##### 3  创建一个Vertex Buffer
创建一个缓冲区。在你的类中添加下列的常量属性
```
    // 3、创建一个Vertex Buffer
    var vertexBuffer: MTLBuffer! = nil
    // 3.1 在CPU创建一个浮点数数组，需要通过把它移动到一个MTLBuffer，来发送这些数据到GPU。
    let vertexData:[Float] = [
         0.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0
    ]
    
```
在MTLDevice上调用makeBuffer(bytes:, length:, options:)，在GPU创建一个新的buffer，从CPU里输送data。options不能为空。
```
        // 3.2 获取vertex data的字节大小。你通过把元素的大小和数组元素个数相乘来得到
        let dataSize = vertexData.count * 4
        // 3.3 在GPU创建一个新的buffer，从CPU里输送data
        vertexBuffer = device.makeBuffer(bytes: vertexData, length: dataSize, options: MTLResourceOptions(rawValue: UInt(0)))

```
##### 4 创建一个Vertex Shader
你之前创建的顶点将成为接下来写的一个叫vertext shader的小程序的输入。
一个vertex shader 是一个在GPU上运行的小程序，它由像c++的一门语言编写，那门语言叫做Metal Shading Language。
一个vertex shader被每个顶点调用，它的工作是接受顶点的信息（如：位置和颜色、纹理坐标），返回一个潜在的修正位置（可能还有别的相关信息）
点击File\New\File，选择iOS\Source\Metal File，然后点击Next。输入Shader.metal作为文件名，然后点击Create。
```
// 一个vertex shader被每个顶点调用，它的工作是接受顶点的信息（如：位置和颜色、纹理坐标），返回一个潜在的修正位置（可能还有别的相关信息）
#include <metal_stdlib>
using namespace metal;
/**
 * 1、所有的vertex shaders必须以关键字vertex开头。函数必须至少返回顶点的最终位置——你通过指定float4（一个元素为4个浮点数的向量）。然后你给一个名字给vetex shader，以后你将用这个名字来访问这个vertex shader。
 * 2、vertex shader会接受一个名叫vertex_id的属性的特定参数，它意味着它会被vertex数组里特定的顶点所装入。
 * 3、一个指向一个元素为packed_float4(一个向量包含4个浮点数)的数组的指针，如：每个顶点的位置。这个 [[ ... ]] 语法被用在声明那些能被用作特定额外信息的属性，像是资源位置，shader输入，内建变量。这里你把这个参数用 [[ buffer(0) ]] 标记，来指明这个参数将会被在你代码中你发送到你的vertex shader的第一块buffer data所遍历。
 * 4、基于vertex id来检索vertex数组中对应位置的vertex并把它返回。向量必须为一个float4类型
vertex float4 basic_vertex (
   constant packed_float3* vertex_array[[buffer(0)]],
                      unsigned int vid[[vertex_id]]){
   return float4(vertex_array[vid], 1.0);
}
 */
```
##### 5  创建一个Fragment Shader
完成vertex shader后，另一个shader，它被每个在屏幕上的fragment(think pixel)调用，它就是fragment shader。
fragment shader通过内插(interpolating)vertex shader的输出来获得自己的输入。
```
/*
 1. 所有fragment shaders必须以fragment关键字开始。这个函数必须至少返回fragment的最终颜色——你通过指定half4（一个颜色的RGBA值）来完成这个任务。注意，half4比float4在内存上更有效率，因为，你写入了更少的GPU内存。
 2. 这里你返回(0.6,0.6,0.6,0.6)的颜色，也就是灰色。
 */
fragment half4 basic_fragment() {
    return half4(0.6);
}
```
##### 6  创建一个Render Pipeline
现在你已经创建了一个vertex shader和一个fragment shader，你需要组合它们（加上一些配置数据）到一个特殊的对象，它名叫render pipeline。Metal的渲染器（shaders）是预编译的，render pipeline 配置会在你第一次设置它的时候被编译，所以所有事情都极其高效。
首先在ViewController.swift里添加一个属性：
```
    // 6、创建一个Render Pipeline
    var pipelineState: MTLRenderPipelineState! = nil
```
在viewDidLoad方法最后添加如下代码：
```
// 6.1 通过调用device.newDefaultLibrary方法获得的MTLibrary对象访问到你项目中的预编译shaders,然后通过名字检索每个shader
        let defaultLibrary = device.newDefaultLibrary()
        let fragmentProgram = defaultLibrary?.makeFunction(name: "basic_fragment")
        let vertextProgram = defaultLibrary?.makeFunction(name: "basic_vertex")
        // 6.2 这里设置你的render pipeline。它包含你想要使用的shaders、颜色附件（color attachment）的像素格式(pixel format)。（例如：你渲染到的输入缓冲区，也就是CAMetalLayer）
        let pipelineStateDescriptor = MTLRenderPipelineDescriptor()
        pipelineStateDescriptor.vertexFunction = vertextProgram
        pipelineStateDescriptor.fragmentFunction = fragmentProgram    pipelineStateDescriptor.colorAttachments[0].pixelFormat = .bgra8Unorm

```
##### 7  创建一个Command Queue
你需要做的最终的设置步骤，是创建一个MTLCommandQueue。
把这个想象成是一个列表装载着你告诉GPU一次要执行的命令。
要创建一个command queue，简单地添加一个属性：
```
    // 7、创建一个Command Queue
    var commandQueue: MTLCommandQueue! = nil
```
把下面这行添加到viewDidLoad中：
```
        // 7.1 初始化commandQueue
        commandQueue = device.makeCommandQueue()
```
预设置的代码到这里完成了。
接下来就是渲染三角形了，它将需要在五个步骤来完成：
1    创建一个Display link。
2    创建一个Render Pass Descriptor
3    创建一个Command Buffer
4    创建一个Render Command Encoder
5    提交Command Buffer的内容
注意：理论上这个应用实际上不需要每帧渲染，因为三角形被绘制之后不会动。但是，大部分应用会有物体的移动，所以我们会那样做。
##### 1    创建一个Display link
在iOS平台上，通过CADisplayLink 类，可以创建一个函数在每次设备屏幕刷新的时候被调用，这样你就可以重绘屏幕。
为了使用它，在类里添加一个新的属性：
```
    // 8、创建一个Display Link
    var timer: CADisplayLink! = nil
```
初始化timer
```
        // 8.1 初始化 timer，设置timer，让它每次刷新屏幕的时候调用一个名叫drawloop的方法
        timer = CADisplayLink(target: self, selector: #selector(ViewController.drawloop))
        timer.add(to: RunLoop.main, forMode: RunLoopMode.defaultRunLoopMode)       
```
渲染的代码在render()中实现
```
    func render() {
        //TODO
    }
    
    func drawloop() {
        self.render()
       
    }
```
##### 2  创建一个Render Pass Descriptor
```
        // metal layer上调用nextDrawable() ，它会返回你需要绘制到屏幕上的纹理(texture)
        let drawable = metalLayer.nextDrawable()
        // 8、创建一个Render Pass Descriptor，配置什么纹理会被渲染到、clear color，以及其他的配置
        let renderPassDesciptor = MTLRenderPassDescriptor()
        renderPassDesciptor.colorAttachments[0].texture = drawable?.texture
        // 设置load action为clear，也就是说在绘制之前，把纹理清空
        renderPassDesciptor.colorAttachments[0].loadAction = .clear
        // 绘制的背景颜色设置为绿色
        renderPassDesciptor.colorAttachments[0].clearColor = MTLClearColorMake(0.0, 0.8, 0.5, 1.0)
```
##### 3  创建一个Command Buffer

一个command buffer包含一个或多个渲染指令（render commands）。
```
        // 9、创建一个Command Buffer
        // 你可以把它想象为一系列这一帧想要执行的渲染命令。注意在你提交command buffer之前，没有事情会真正发生，这样给你对事物在何时发生有一个很好的控制。
        let commandBuffer = commandQueue.makeCommandBuffer()
```
##### 4  创建一个渲染命令编码器(Render Command Encoder)
```
 // 10、创建一个渲染命令编码器(Render Command Encoder)
     // 创建一个command encoder，并指定你之前创建的pipeline和顶点
        let renderEncoder = commandBuffer.makeRenderCommandEncoder(descriptor: renderPassDesciptor)
        renderEncoder.setRenderPipelineState(pipelineState)
        renderEncoder.setVertexBuffer(vertexBuffer, offset: 0, at: 0)
        /**
           绘制图形
         - parameter type:          画三角形
         - parameter vertexStart:   从vertex buffer 下标为0的顶点开始
         - parameter vertexCount:   顶点数
         - parameter instanceCount: 总共有1个三角形
         */
        renderEncoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3, instanceCount: 1)
       
        // 完成后，调用endEncoding()
        renderEncoder.endEncoding()

``` 
##### 5  提交Command Buffer
```
        // 保证新纹理会在绘制完成后立即出现
        commandBuffer.present(drawable!)
        // 提交事务(transaction), 把任务交给GPU
        commandBuffer.commit()
```
##### 学习资料：
•    苹果Metal[开发者文档](https://developer.apple.com/metal/)，有很多文档、录像、样例代码的链接。
•    苹果的Metal[编程指导](https://developer.apple.com/library/prerelease/ios/documentation/Miscellaneous/Conceptual/MTLProgGuide/Introduction/Introduction.html)
•    苹果的Metal [Shading Language 指导](https://developer.apple.com/library/prerelease/ios/documentation/Metal/Reference/MetalShadingLanguageGuide/Introduction/Introduction.html)
•    [WWDC2014 Metal录像](https://developer.apple.com/videos/wwdc/2014/)
