---
title: Metal实现YUV转RGB渲染视频
date: 2018-05-09 
tags:
    - Metal
    - iOS
---
本次例子使用的是`AVFoundation`提供的`AVCaptureVideoDataOutput`获取每一帧的`CVPixelBufferRef`，详细步骤就不说了，网上有很多例子，这篇文章主要是介绍Metal中实现YUV转RGB格式的一些主要步骤，和OpenGL中的步骤差不多，主要是API和着色器不同，思路是一样的，这篇文章适合熟悉`OpenGL`视频渲染和有`Metal`基础的人观看，代码就不一一注释了，主要是本人理解的也不是很深，怕误人子弟。（示例代码为横屏显示，所以看到的屏幕是横屏显示）
[源代码下载地址](https://github.com/OrangesChen/Metal/tree/VideoCapture)

<!--more-->
###### 1 首先是shader上的片元着色器转换YUV到RGB
```
#include <metal_stdlib>
using namespace metal;
#define YUV_SHADER_ARGS  VertexOut      inFrag    [[ stage_in ]],\
texture2d<float>  lumaTex     [[ texture(0) ]],\
texture2d<float>  chromaTex     [[ texture(1) ]],\
sampler bilinear [[ sampler(0) ]], \
constant ColorParameters *colorParameters [[ buffer(0) ]]// RGB到YUV的转换矩阵
struct VertexIn{
    packed_float3 position;
    packed_float4 color;
    packed_float2 st;
};

struct VertexOut{
    float4 position [[position]];  //1
    float4 color;
    float2 st;
};
struct ColorParameters
{
    float3x3 yuvToRGB;
};
vertex VertexOut texture_vertex(
                              const device VertexIn* vertex_array [[ buffer(0) ]],           //1
                              unsigned int vid [[ vertex_id ]]) {
    
    
    VertexIn VertexIn = vertex_array[vid];
    
    VertexOut VertexOut;
    VertexOut.position = float4(VertexIn.position,1);  //3
    VertexOut.color = VertexIn.color;
    VertexOut.st = VertexIn.st;
    return VertexOut;
}
fragment half4 yuv_rgb(YUV_SHADER_ARGS)
{
    float3 yuv;
    yuv.x = lumaTex.sample(bilinear, inFrag.st).r;
    yuv.yz = chromaTex.sample(bilinear,inFrag.st).rg - float2(0.5);
    return half4(half3(colorParameters->yuvToRGB * yuv),yuv.x);
}
```

###### 2 添加纹理缓存CVMetalTextureCacheRef和纹理MTLTexture变量
```
  CVMetalTextureCacheRef _videoTextureCache;
   id<MTLTexture> _videoTexture[2];
   CVPixelBufferRef _pixelBuffer;
```
添加转换矩阵的接收变量
```
@property (nonatomic, strong)  id<MTLBuffer> parametersBuffer;
```
以下几个都是YUV转RGB的矩阵算法，给parametersBuffer赋值，拷贝到GPU中计算
```
 _parametersBuffer = [_device newBufferWithLength:sizeof(ColorParameters) * 2 options:MTLResourceOptionCPUCacheModeDefault];
     ColorParameters matrix;
     simd::float3 A;
     simd::float3 B;
     simd::float3 C;
     
     // 1
     //    A.x = 1;
     //    A.y = 1;
     //    A.z = 1;
     //
     //    B.x = 0;
     //    B.y = -0.343;
     //    B.z = 1.765;
     //
     //    C.x = 1.4;
     //    C.y = -0.765;
     //    C.z = 0;
     
     // 2
     //    A.x = 1.164;
     //    A.y = 1.164;
     //    A.z = 1.164;
     //
     //    B.x = 0;
     //    B.y = -0.392;
     //    B.z = 2.017;
     //
     //    C.x = 1.596;
     //    C.y = -0.813;
     //    C.z = 0;

     // 3
     A.x = 1.164;
     A.y = 1.164;
     A.z = 1.164;

     B.x = 0;
     B.y = -0.231;
     B.z = 2.112;

     C.x = 1.793;
     C.y = -0.533;
     C.z = 0;
     matrix.yuvToRGB = simd::float3x3{A, B, C}; 
     memcpy(self.parametersBuffer.contents, &matrix, sizeof(ColorParameters));
```
获取每一帧视频信息生成纹理的代码
```
- (void)makeYUVTexture:(CVPixelBufferRef)pixelBuffer {
    CVMetalTextureRef y_texture ;
    float y_width = CVPixelBufferGetWidthOfPlane(pixelBuffer, 0);
    float y_height = CVPixelBufferGetHeightOfPlane(pixelBuffer, 0);
 CVMetalTextureCacheCreateTextureFromImage(kCFAllocatorDefault, _videoTextureCache, pixelBuffer, nil, MTLPixelFormatR8Unorm, y_width, y_height, 0, &y_texture);
 
    CVMetalTextureRef uv_texture;
    float uv_width = CVPixelBufferGetWidthOfPlane(pixelBuffer, 1);
    float uv_height = CVPixelBufferGetHeightOfPlane(pixelBuffer, 1);
    CVMetalTextureCacheCreateTextureFromImage(kCFAllocatorDefault, _videoTextureCache, pixelBuffer, nil, MTLPixelFormatRG8Unorm, uv_width, uv_height, 1, &uv_texture);
    
    id<MTLTexture> luma = CVMetalTextureGetTexture(y_texture);
    id<MTLTexture> chroma = CVMetalTextureGetTexture(uv_texture);
    
    _videoTexture[0] = luma;
    _videoTexture[1] = chroma;
    
    CVBufferRelease(y_texture);
    CVBufferRelease(uv_texture);
}

- (void)display:(CVPixelBufferRef)overlay {
    if (!overlay) {
        return;
    }
    if (!_videoTextureCache) {
        NSLog(@"No video texture cache");
        return;
    }
    [self makeYUVTexture:overlay];
}
- (void)setVideoTexture {
 CVMetalTextureCacheFlush(_videoTextureCache, 0);
    CVReturn err = CVMetalTextureCacheCreate(kCFAllocatorDefault, NULL, _device, NULL, &_videoTextureCache);
    if (err) {
        NSLog(@">> ERROR: Could not create a texture cache");
        assert(0);
    }
}
```
![效果图.PNG](/assets/img/yuv_rgb_picture.png)

#`（最后PS： 有大神知道怎么使用Metal实现渲染到纹理的么，求指导）`
