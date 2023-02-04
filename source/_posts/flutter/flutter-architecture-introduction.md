---
title: Flutter 架构层
date: 2023-02-04 11:57:10
tags:
    - Flutter
    - FrontEnd
---

Flutter 采用了分层设计模式，整体架构分为三层：**Framework（框架层）**、**Engine（引擎）**、**Embedder（嵌入）**。Flutter 设计之初的目标是成为一个能够直接和系统底层交互的同时，又可以在不同平台间代码尽可能复用的高性能 UI 工具集。
![image.png](/assets/flutter/flutter-architecture-introduction/c81de15e03a7.png)
这样设计的好处是让架构的每一个组件都变得可插拔、可替换。

<!--more-->

#### Embedder （嵌入层）
为 Engine 创建和管理线程，作用是把 Engine 的 Task Runners（任务运行器）运行在嵌入层管理的线程上。将 Flutter 嵌入到 Native 平台，例如 Android、iOS。职责是为渲染 UI 到 Surface、处理单击事件等于平台交互的行为提供一个入口，使用的编程语言取决于具体平台，对于 Android 来说，通常是 C++ 和 Java。
#### Engine （引擎层）
Engine 是 Flutter 的核心部分，大部分代码是由 C++ 实现。职责是为 Flutter 合成并渲染数据，提供一系列底层基础能力，包括图形绘制（Skia）、文字渲染、文件和网络 I/O、平台插件、Dart 运行时管理和编译工具链等。主要功能通过 dart:ui 模块和 Framework 进行双向交互。
#### Framework （框架层）
通常来说开发者并不需要感知到 Engine 和 Embedder 的存在，如果不需要调用平台的系统服务，Framework 是开发者需要直接交互的，因此是整个分层结构的最上层。Framewok 是由 Dart 开发，提供了一套响应式 UI 框架，Framework 本身也是分层的，自底向上角色如下：
1. Foundation、Animation、Painting 和 Gesture 提供了 Framework 公用的底层能力，是对 Engine 的抽象和封装。
2. Rendering 主要负责 Render Tree 的 Layout 等操作，并最终将绘制指令发送到 Engine 进行绘制上屏操作。
3. Widgets  是对 Rendering 的封装，Render Tree 虽然能够决定最终的 UI，但是过于复杂，不适合开发者使用，Widgets 通过组合思想，提供了丰富的 Widgets 组件供开发者使用。
4. Material 和 Cupertino 是对 Widgets 的进一步封装，Widgets 提供的组件对于开发者来说还是过于原始，这一层基于 Android 和 iOS 的设计规范提供了更完备的组件，保证开发者能够开箱即用。

#### 为什么选择使用 Dart ？
1. Dart 运行在 Dart 虚拟机上，但也可以编译为直接在硬件上运行的 ARM 代码。
2. Dart 同时支持预编译（AOT）和运行时编译（JIT）两种编译方式，提高开发和执行程序的效率。
3. Dart 可以使用隔离（isolate）实现多线程，如果没有共享内存，则可以实现快速无锁分配。
4. Dart 虚拟机采用了分代垃圾回收方案，适用于 UI 框架中产生大量的组件对象的创建和销毁。
5. 当为创建的对象分配内存时，Dart 使用指针在现有的堆上移动，可以确保内存的线性增长，从而节省了查找可用内存的时间。
6. 无需引入 xml、jsx 这类模版文件将布局和逻辑代码分离。

#### Flutter 渲染管道
Flutter 3 棵树模型如图所示：
![image.png](/assets/flutter/flutter-architecture-introduction/e43372f5b85b.png)
每个 Widget 都会有对应的 Element，并存在一棵对应的 Element Tree。实际上 Element Tree 才是内存中真实存在的数据，Widget Tree 和 Render Tree 都是由 Element Tree 驱动生成的。正是由于这种机制，Element Tree 扮演了 Flutter 中 Virtual DOM 的管理者角色。对开发者来说 Render Tree 是最底层的 UI 描述，但对 Engine 来说，Render Tree 是 Framework 对 UI 的最上层、最抽象的描述。
Element Tree 和 Widget Tree 相对应，由一个个元素组成，可以把元素理解为展示在屏幕上真正的 UI 组件，开发者在代码中创建的组件仅仅作为 Flutter 创建元素的配置信息，build 方法之后创建，生成一个个与组件对应的元素示例，生成元素树。
RenderObject 负责页面中组件的绘制和布局，组成对应的 Render Tree（渲染树）。当 Element 挂载到元素树上后，就会调用组件的 createRenderObject 方法生成对应的 RenderObject 被元素树引用，因此也常被称为元素树的子树。RenderObject 是一个抽象类，每种 Element 会指向不同的渲染对象。
![](/assets/flutter/flutter-architecture-introduction/4158485498db.jpeg)

#### 渲染管道
由于采用了自渲染的方式，Flutter 的渲染管道是独立于平台的。Flutter 通过 Embedder 获取了一个 Surface 或者 Texture 作为自己渲染管道的最终输出目标，渲染管道分为以下7个步骤：
![](/assets/flutter/flutter-architecture-introduction/a631497aee49.jpeg)
用户输入和动画是相对独立的，一些简单的静态 UI 不需要处理用户输入，也不需要展示动画。构建、布局、绘制则直接关系到三棵树的维护和使用，是 Framework 的核心功能之一，Flutter 底层工作机制的关键。合成和栅格化负责绘制指令的最终消费，主要逻辑在 Engine 中。
