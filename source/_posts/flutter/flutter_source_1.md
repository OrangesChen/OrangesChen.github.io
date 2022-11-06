---
title: Flutter 内核源码解析一Flutter 启动篇
date: 2022-11-02 14:45:22
tags:
    - Flutter
    - FrontEnd
---

Flutter engine [源码编译](https://github.com/flutter/flutter/wiki/Setting-up-the-Engine-development-environment)，注意 Flutter Framework 对应的 engine 版本和源码的 engine 版本要保持一致。假设你已经成功编译源码，以下为 Flutter 3.0 对应的版本源码，若你使用的是其他版本的，源码可能会存在一些差异。

<!--more-->

## Flutter 源码目录结构

> 开始这篇文章前，首先我们要明确的是，Framework 源码位于 flutter/flutter 中，通过 `git clone [https://github.com/flutter/flutter.git](https://github.com/flutter/flutter.git) -b stable`获取的，开发过程中断点调试的源码指的就是这个项目的，后续相关路径以 flutter 表示该目录；而 Engine 和 Embedder 的源码位于通过[源码编译](https://github.com/flutter/flutter/wiki/Setting-up-the-Engine-development-environment)获取到的源码 flutter_source/src/flutter 目录中，后续相关路径以 engine 表示该目录。

以下为 Framework 源码实现，开发者接触到的代码层，flutter 目录如下图所示：
![flutter 源码结构.png](/assets/flutter/flutter_source_1/87bc703bcada.png)
<center><p>flutter 源码结构</p></center>

![bin/internal 源码结构.png](/assets/flutter/flutter_source_1/6c1f19adb2da.png)
<center><p>bin/internal 源码结构</p></center>

![flutter/packages 源码结构.png](/assets/flutter/flutter_source_1/54417118d0dd.png )
<center><p>flutter/packages 源码结构</p></center>

其中`Flutter SDK` 源码指的是 Dart 实现的 Framework 层的源码。
以下则为 depot_tools 获取到的 engine 目录，其中包含了 Engine 和 Embedder 层的相关实现。
![flutter/engine 目录结构.png](/assets/flutter/flutter_source_1/ed5105e7e229.png)
<center><p>flutter/engine 目录结构</p></center>

> 需要先使用 ./flutter/tools/gn 生成构建所需的元文件，再使用 ninja 构建出最终的产物，构建出对应平台的源码。

![./flutter/tools/gn 和 ninja 工具构建不同平台的产物.png](/assets/flutter/flutter_source_1/fb5c841caa47.png )
<center><p>./flutter/tools/gn 和 ninja 工具构建不同平台的产物</p></center>

`hot_debug_unopt` 的作用是构建 flutter 工程，生成 `Dart Kernel` 或者特定平台的 AOT 文件，能在 x86 架构的 PC 设备上生成 ARM 架构的机器码，生成构建 Flutter Engine 所需的元文件。
`ios_debug_unopt/android_denug_unopt`存放最终构建出的 Engine 和 Embedder 产物，项目里面 `compile_commands.json` 存储了 Engine 中代码的交叉索引，后续源码调试需要使用到这个文件。

![ios_debug_unopt 源码结构，engine 源码调试的路径.png](/assets/flutter/flutter_source_1/47fc841005be.png)
<center><p>ios_debug_unopt 源码结构，engine 源码调试的路径</p></center>

## Flutter 源码调试

### Framework 源码

`Framework` 源码调试很简单，在 flutter 项目中直接设置断点就能跳转到对应的源码文件地址查看。

### Engine/Embedder 源码

```powershell
flutter run ios --local-engine=ios_debug_unopt  --local-engine-src-path=/Volumes/TSB\ 1/OpenCode/engine/src
```

运行成功后，iOS 项目 `Generated.xcconfig` 配置 `FLUTTER_ENGINE`、`LOCAL_ENGINE` 更新为 Flutter Engine 源码地址， 将 `LOCAL_ENGINE` 源码 `flutter_engine.xcodeproj`拖到项目中

![image.png](/assets/flutter/flutter_source_1/3bd3b35575b5.png)

`flutter_engine.xcodeproj` 项目里设置断点，运行代码，则可开始调试 Engine/Embedder 源码

![image.png](/assets/flutter/flutter_source_1/b7fef6297e9e.png)

## Flutter 启动流程

Embedder 是 Flutter 接入原生平台的关键，位于整个 Flutter 架构底层，负责 Engine 的创建、管理与销毁，同时也为 Engine 提供绘制 UI 接口。在 Embedder 中，iOS 端的 `FlutterViewController` 和 Android 端的 `FlutterActivity`、`FlutterFragment` 是开发者最常接触的类。

### FlutterViewController 源码解析

`FlutterViewController` 中持有两个关键的对象 `FlutterView` 和 `FlutterEngine`，`FlutterEngine` 负责 Engine 在 Embedder 中的调用和管理，`FlutterView` 则负责 Engine 中 UI 数据的上屏显示。

![](/assets/flutter/flutter_source_1/35cc45f52143.jpeg)

```objectivec
@implementation FlutterViewController {
  std::unique_ptr<fml::WeakPtrFactory<FlutterViewController>> _weakFactory;
  // flutterEngine
  fml::scoped_nsobject<FlutterEngine> _engine;

  // We keep a separate reference to this and create it ahead of time because we want to be able to
  // set up a shell along with its platform view before the view has to appear.
  // flutterView
  fml::scoped_nsobject<FlutterView> _flutterView;
  // 闪屏
  fml::scoped_nsobject<UIView> _splashScreenView;
  // flutterView 渲染回调
  fml::ScopedBlock<void (^)(void)> _flutterViewRenderedCallback;
  // 设备方向
  UIInterfaceOrientationMask _orientationPreferences;
  // 设备 statusBar 样式
  UIStatusBarStyle _statusBarStyle;
  flutter::ViewportMetrics _viewportMetrics;
  BOOL _initialized;
  BOOL _viewOpaque;
  BOOL _engineNeedsLaunch;
  fml::scoped_nsobject<NSMutableSet<NSNumber*>> _ongoingTouches;
  // This scroll view is a workaround to accommodate iOS 13 and higher.  There isn't a way to get
  // touches on the status bar to trigger scrolling to the top of a scroll view.  We place a
  // UIScrollView with height zero and a content offset so we can get those events. See also:
  // https://github.com/flutter/flutter/issues/35050
  fml::scoped_nsobject<UIScrollView> _scrollView;
  fml::scoped_nsobject<UIHoverGestureRecognizer> _hoverGestureRecognizer API_AVAILABLE(ios(13.4));
  fml::scoped_nsobject<UIPanGestureRecognizer> _panGestureRecognizer API_AVAILABLE(ios(13.4));
  fml::scoped_nsobject<UIView> _keyboardAnimationView;
  MouseState _mouseState;
}

```

`FlutterViewController` 实现 `FlutterViewResponder` 协议，处理触摸事件

```objectivec
@protocol FlutterViewResponder <NSObject>

@property(nonatomic, strong) UIView* view;

- (void)touchesBegan:(NSSet*)touches withEvent:(UIEvent*)event;
- (void)touchesMoved:(NSSet*)touches withEvent:(UIEvent*)event;
- (void)touchesEnded:(NSSet*)touches withEvent:(UIEvent*)event;
- (void)touchesCancelled:(NSSet*)touches withEvent:(UIEvent*)event;
- (void)touchesEstimatedPropertiesUpdated:(NSSet*)touches;

@end
```

![FlutterViewController 初始化.png](/assets/flutter/flutter_source_1/42727c1736bc.png)
<center><p></p></center>

可以看到初始化方式有两种，其本质上是一样的，以下这个构造方法是为了在存在多个 `FlutterViewController` 的情况下复用 `FlutterEngine` 对象。

```objectivec
- (instancetype)initWithEngine:(FlutterEngine*)engine
                       nibName:(nullable NSString*)nibName
                        bundle:(nullable NSBundle*)nibBundle {
  NSAssert(engine != nil, @"Engine is required");
  self = [super initWithNibName:nibName bundle:nibBundle];
  if (self) {
    _viewOpaque = YES;
    if (engine.viewController) {
      FML_LOG(ERROR) << "The supplied FlutterEngine " << [[engine description] UTF8String]
                     << " is already used with FlutterViewController instance "
                     << [[engine.viewController description] UTF8String]
                     << ". One instance of the FlutterEngine can only be attached to one "
                        "FlutterViewController at a time. Set FlutterEngine.viewController "
                        "to nil before attaching it to another FlutterViewController.";
    }
    // 初始化或者替换当前的 FlutterEngine
    _engine.reset([engine retain]);
    _engineNeedsLaunch = NO;
    // 初始化或者替换当前的 FlutterView
    _flutterView.reset([[FlutterView alloc] initWithDelegate:_engine opaque:self.isViewOpaque]);

    _weakFactory = std::make_unique<fml::WeakPtrFactory<FlutterViewController>>(self);
    // 初始化正在发生的手势集合
    _ongoingTouches.reset([[NSMutableSet alloc] init]);
    /**
          1. 设置 UIInterfaceOrientationMask 和 UIStatusBarStyle
          2. 添加一些列通知 Application 生命周期、键盘事件、Accessibility 的事件等
     */
    [self performCommonViewControllerInitialization];
    // 将 FlutterViewController 设置给 FlutterEngine
    [engine setViewController:self];
  }
  return self;
}
```

ViewController 初始化设置，添加通知消息订阅
![image.png](/assets/flutter/flutter_source_1/72275ef529d6.png)

这三个接口允许我们对 Dart 的 Navigator 直接进行操作，通过 Platform Channel 实现

```objectivec
- (void)setInitialRoute:(NSString*)route {
  [[_engine.get() navigationChannel] invokeMethod:@"setInitialRoute" arguments:route];
}

- (void)popRoute {
  [[_engine.get() navigationChannel] invokeMethod:@"popRoute" arguments:nil];
}

- (void)pushRoute:(NSString*)route {
  [[_engine.get() navigationChannel] invokeMethod:@"pushRoute" arguments:route];
}
```

加载 view
![loadView.png](/assets/flutter/flutter_source_1/cc17e4c684fd.png)

```objectivec
- (void)loadView {
  // 初始化并创建 view，存在返回，不存在则创建
  self.view = GetViewOrPlaceholder(_flutterView.get());
  self.view.multipleTouchEnabled = YES;
  self.view.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  // 加载闪屏页面 内部会会判断是否加载闪屏页
  [self installSplashScreenViewIfNecessary];
  // 初始化 scrollView
  UIScrollView* scrollView = [[UIScrollView alloc] init];
  scrollView.autoresizingMask = UIViewAutoresizingFlexibleWidth;
  // The color shouldn't matter since it is offscreen.
  scrollView.backgroundColor = UIColor.whiteColor;
  scrollView.delegate = self;
  // This is an arbitrary small size.
  // 设置任意的小尺寸 static constexpr CGFloat kScrollViewContentSize = 2.0;
  scrollView.contentSize = CGSizeMake(kScrollViewContentSize, kScrollViewContentSize);
  // This is an arbitrary offset that is not CGPointZero.
  scrollView.contentOffset = CGPointMake(kScrollViewContentSize, kScrollViewContentSize);
  [self.view addSubview:scrollView];
  _scrollView.reset(scrollView);
}
```

```objectivec
- (void)installSplashScreenViewIfNecessary {
  // Show the launch screen view again on top of the FlutterView if available.
  // This launch screen view will be removed once the first Flutter frame is rendered.
  // 当首帧 Flutter View 渲染成功后，则将闪屏页面移除
  if (_splashScreenView && (self.isBeingPresented || self.isMovingToParentViewController)) {
    [_splashScreenView.get() removeFromSuperview];
    _splashScreenView.reset();
    return;
  }

  // Use the property getter to initialize the default value.
  UIView* splashScreenView = self.splashScreenView;
  if (splashScreenView == nil) {
    return;
  }
  splashScreenView.frame = self.view.bounds;
  // 加载闪屏页
  [self.view addSubview:splashScreenView];
}
```

`SplashScreenView` 闪屏获取，属性 getter 方法实现，实现比较简单，源码就不显示出来了

![image.png](/assets/flutter/flutter_source_1/b16ba107ef75.png)

Surface 创建和销毁

```objectivec

#pragma mark - Surface creation and teardown updates

- (void)surfaceUpdated:(BOOL)appeared {
  if (!_engine) {
    return;
  }

  // NotifyCreated/NotifyDestroyed are synchronous and require hops between the UI and raster
  // thread.
  // NotifyCreated/NotifyDestroyed 是同步的，需要在 UI 和 raster 线程切换
  if (appeared) {
    // surface 创建
    [self installFirstFrameCallback];
    [_engine.get() platformViewsController]->SetFlutterView(_flutterView.get());
    [_engine.get() platformViewsController]->SetFlutterViewController(self);
    [_engine.get() iosPlatformView]->NotifyCreated();
  } else {
    // surface 销毁
    self.displayingFlutterUI = NO;
    [_engine.get() iosPlatformView]->NotifyDestroyed();
    [_engine.get() platformViewsController]->SetFlutterView(nullptr);
    [_engine.get() platformViewsController]->SetFlutterViewController(nullptr);
  }
}
```

UIViewController、UIApplication 生命周期监听

![image.png](/assets/flutter/flutter_source_1/95c99e13fea0.png)

原生生命周期和 Flutter 中 `AppLifecycleState` 的对应关系

![](/assets/flutter/flutter_source_1/13f74c316175.jpeg)

```objectivec
- (void)viewDidDisappear:(BOOL)animated {
  TRACE_EVENT0("flutter", "viewDidDisappear");
  if ([_engine.get() viewController] == self) {
    // 停止 vsync 刷新
    [self invalidateDisplayLink];
    // // 确保 `physical_view_inset_bottom` 是目标值。
    [self ensureViewportMetricsIsCorrect];
    // 停止 surface 更新
    [self surfaceUpdated:NO];
    [[_engine.get() lifecycleChannel] sendMessage:@"AppLifecycleState.paused"];
    // 移除正在执行的手势事件
    [self flushOngoingTouches];
    [_engine.get() notifyLowMemory];
  }

  [super viewDidDisappear:animated];
}

- (void)flushOngoingTouches {
  // 获取正在执行的所有手势事件 创建假的 PointerData 包装成 packet 结构体
  if (_engine && _ongoingTouches.get().count > 0) {
    auto packet = std::make_unique<flutter::PointerDataPacket>(_ongoingTouches.get().count);
    size_t pointer_index = 0;
    // If the view controller is going away, we want to flush cancel all the ongoing
    // touches to the framework so nothing gets orphaned.
    for (NSNumber* device in _ongoingTouches.get()) {
      // Create fake PointerData to balance out each previously started one for the framework.
      flutter::PointerData pointer_data = [self generatePointerDataForFake];
      // 操作类型为取消
      pointer_data.change = flutter::PointerData::Change::kCancel;
      pointer_data.device = device.longLongValue;
      pointer_data.pointer_identifier = 0;

      // Anything we put here will be arbitrary since there are no touches.
      pointer_data.physical_x = 0;
      pointer_data.physical_y = 0;
      pointer_data.physical_delta_x = 0.0;
      pointer_data.physical_delta_y = 0.0;
      pointer_data.pressure = 1.0;
      pointer_data.pressure_max = 1.0;

      packet->SetPointerData(pointer_index++, pointer_data);
    }

    [_ongoingTouches removeAllObjects];
    [_engine.get() dispatchPointerDataPacket:std::move(packet)];
  }
}
```

手势事件处理
![image.png](/assets/flutter/flutter_source_1/16d1b1a31b76.png)

核心代码为 `dispatchTouches`方法，将 Touches 分发给 Engine

```objectivec
// Dispatches the UITouches to the engine. Usually, the type of change of the touch is determined
// from the UITouch's phase. However, FlutterAppDelegate fakes touches to ensure that touch events
// in the status bar area are available to framework code. The change type (optional) of the faked
// touch is specified in the second argument.
/// 将 Touches 分配给引擎
- (void)dispatchTouches:(NSSet*)touches
    pointerDataChangeOverride:(flutter::PointerData::Change*)overridden_change
                        event:(UIEvent*)event {
  if (!_engine) {
    return;
  }

  const CGFloat scale = [UIScreen mainScreen].scale;
  auto packet = std::make_unique<flutter::PointerDataPacket>(touches.count);

  size_t pointer_index = 0;

  for (UITouch* touch in touches) {
    CGPoint windowCoordinates = [touch locationInView:self.view];

    flutter::PointerData pointer_data;
    pointer_data.Clear();

    constexpr int kMicrosecondsPerSecond = 1000 * 1000;
    pointer_data.time_stamp = touch.timestamp * kMicrosecondsPerSecond;

    pointer_data.change = overridden_change != nullptr
                              ? *overridden_change
                              : PointerDataChangeFromUITouchPhase(touch.phase);

    pointer_data.kind = DeviceKindFromTouchType(touch);

    pointer_data.device = reinterpret_cast<int64_t>(touch);

    // Pointer will be generated in pointer_data_packet_converter.cc.
    pointer_data.pointer_identifier = 0;

    pointer_data.physical_x = windowCoordinates.x * scale;
    pointer_data.physical_y = windowCoordinates.y * scale;

    // Delta will be generated in pointer_data_packet_converter.cc.
    pointer_data.physical_delta_x = 0.0;
    pointer_data.physical_delta_y = 0.0;

    NSNumber* deviceKey = [NSNumber numberWithLongLong:pointer_data.device];
    // Track touches that began and not yet stopped so we can flush them
    // if the view controller goes away.
    // 只处理 tracking starts 和 stops 事件
    switch (pointer_data.change) {
      case flutter::PointerData::Change::kDown:
        [_ongoingTouches addObject:deviceKey];
        break;
      case flutter::PointerData::Change::kCancel:
      case flutter::PointerData::Change::kUp:
        [_ongoingTouches removeObject:deviceKey];
        break;
      case flutter::PointerData::Change::kHover:
      case flutter::PointerData::Change::kMove:
        // We're only tracking starts and stops.
        break;
      case flutter::PointerData::Change::kAdd:
      case flutter::PointerData::Change::kRemove:
        // We don't use kAdd/kRemove.
        break;
      case flutter::PointerData::Change::kPanZoomStart:
      case flutter::PointerData::Change::kPanZoomUpdate:
      case flutter::PointerData::Change::kPanZoomEnd:
        // We don't send pan/zoom events here
        break;
    }

    // pressure_min is always 0.0
    if (@available(iOS 9, *)) {
      // These properties were introduced in iOS 9.0.
      pointer_data.pressure = touch.force;
      pointer_data.pressure_max = touch.maximumPossibleForce;
    } else {
      pointer_data.pressure = 1.0;
      pointer_data.pressure_max = 1.0;
    }

    // These properties were introduced in iOS 8.0
    pointer_data.radius_major = touch.majorRadius;
    pointer_data.radius_min = touch.majorRadius - touch.majorRadiusTolerance;
    pointer_data.radius_max = touch.majorRadius + touch.majorRadiusTolerance;

    // These properties were introduced in iOS 9.1
    if (@available(iOS 9.1, *)) {
      pointer_data.tilt = M_PI_2 - touch.altitudeAngle;
      pointer_data.orientation = [touch azimuthAngleInView:nil] - M_PI_2;
    }

    if (@available(iOS 13.4, *)) {
      if (event != nullptr) {
        pointer_data.buttons = (((event.buttonMask & UIEventButtonMaskPrimary) > 0)
                                    ? flutter::PointerButtonMouse::kPointerButtonMousePrimary
                                    : 0) |
                               (((event.buttonMask & UIEventButtonMaskSecondary) > 0)
                                    ? flutter::PointerButtonMouse::kPointerButtonMouseSecondary
                                    : 0);
      }
    }

    packet->SetPointerData(pointer_index++, pointer_data);
  }

  [_engine.get() dispatchPointerDataPacket:std::move(packet)];
}

- (void)touchesBegan:(NSSet*)touches withEvent:(UIEvent*)event {
  [self dispatchTouches:touches pointerDataChangeOverride:nullptr event:event];
}

- (void)touchesMoved:(NSSet*)touches withEvent:(UIEvent*)event {
  [self dispatchTouches:touches pointerDataChangeOverride:nullptr event:event];
}

- (void)touchesEnded:(NSSet*)touches withEvent:(UIEvent*)event {
  [self dispatchTouches:touches pointerDataChangeOverride:nullptr event:event];
}

- (void)touchesCancelled:(NSSet*)touches withEvent:(UIEvent*)event {
  [self dispatchTouches:touches pointerDataChangeOverride:nullptr event:event];
}

- (void)forceTouchesCancelled:(NSSet*)touches {
  flutter::PointerData::Change cancel = flutter::PointerData::Change::kCancel;
  [self dispatchTouches:touches pointerDataChangeOverride:&cancel event:nullptr];
}
```

键盘事件处理，这块内容主要是键盘显示动画
![image.png](/assets/flutter/flutter_source_1/8f7f17c45f35.png)
**PlatformViews**、**FlutterBinaryMessenger、FlutterTextureRegistry、FlutterPluginRegistry** 具体实现在 `FlutterEngine` 类中，后面会对 `FlutterEngine` 源码进行解析。
![image.png](/assets/flutter/flutter_source_1/a60a67313076.png)

### FlutterEngine 源码分析

`FlutterEngine` 在 `FlutterViewController` 中初始化完成相关成员变量的配置。

```objectivec
@interface FlutterEngineRegistrar : NSObject <FlutterPluginRegistrar>
@property(nonatomic, assign) FlutterEngine* flutterEngine;
- (instancetype)initWithPlugin:(NSString*)pluginKey flutterEngine:(FlutterEngine*)flutterEngine;
@end

@interface FlutterEngine () <FlutterIndirectScribbleDelegate,
                             FlutterTextInputDelegate,
                             FlutterBinaryMessenger>
// Maintains a dictionary of plugin names that have registered with the engine.  Used by
// FlutterEngineRegistrar to implement a FlutterPluginRegistrar.
@property(nonatomic, readonly) NSMutableDictionary* pluginPublications;
@property(nonatomic, readonly) NSMutableDictionary<NSString*, FlutterEngineRegistrar*>* registrars;

@property(nonatomic, readwrite, copy) NSString* isolateId;
@property(nonatomic, copy) NSString* initialRoute;
@property(nonatomic, retain) id<NSObject> flutterViewControllerWillDeallocObserver;
@end

@implementation FlutterEngine {
  fml::scoped_nsobject<FlutterDartProject> _dartProject;
  std::shared_ptr<flutter::ThreadHost> _threadHost;
  std::unique_ptr<flutter::Shell> _shell;
  NSString* _labelPrefix;
  std::unique_ptr<fml::WeakPtrFactory<FlutterEngine>> _weakFactory;

  fml::WeakPtr<FlutterViewController> _viewController;
  fml::scoped_nsobject<FlutterObservatoryPublisher> _publisher;

  std::shared_ptr<flutter::FlutterPlatformViewsController> _platformViewsController;
  flutter::IOSRenderingAPI _renderingApi;
  std::shared_ptr<flutter::ProfilerMetricsIOS> _profiler_metrics;
  std::shared_ptr<flutter::SamplingProfiler> _profiler;

  // Channels 内置 Channels
  fml::scoped_nsobject<FlutterPlatformPlugin> _platformPlugin;
  fml::scoped_nsobject<FlutterTextInputPlugin> _textInputPlugin;
  fml::scoped_nsobject<FlutterRestorationPlugin> _restorationPlugin;
  fml::scoped_nsobject<FlutterMethodChannel> _localizationChannel;
  fml::scoped_nsobject<FlutterMethodChannel> _navigationChannel;
  fml::scoped_nsobject<FlutterMethodChannel> _restorationChannel;
  fml::scoped_nsobject<FlutterMethodChannel> _platformChannel;
  fml::scoped_nsobject<FlutterMethodChannel> _platformViewsChannel;
  fml::scoped_nsobject<FlutterMethodChannel> _textInputChannel;
  fml::scoped_nsobject<FlutterBasicMessageChannel> _lifecycleChannel;
  fml::scoped_nsobject<FlutterBasicMessageChannel> _systemChannel;
  fml::scoped_nsobject<FlutterBasicMessageChannel> _settingsChannel;
  fml::scoped_nsobject<FlutterBasicMessageChannel> _keyEventChannel;

  int64_t _nextTextureId;

  BOOL _allowHeadlessExecution;
  BOOL _restorationEnabled;
  FlutterBinaryMessengerRelay* _binaryMessenger;
  std::unique_ptr<flutter::ConnectionCollection> _connections;
}
```

`FlutterEngine` 启动，主要做两件事情：

- createShell
- launchEngine

```objectivec
- (BOOL)runWithEntrypoint:(NSString*)entrypoint
               libraryURI:(NSString*)libraryURI
             initialRoute:(NSString*)initialRoute
           entrypointArgs:(NSArray<NSString*>*)entrypointArgs {
  if ([self createShell:entrypoint libraryURI:libraryURI initialRoute:initialRoute]) {
    [self launchEngine:entrypoint libraryURI:libraryURI entrypointArgs:entrypointArgs];
  }

  return _shell != nullptr;
}
```

```objectivec
- (BOOL)createShell:(NSString*)entrypoint
         libraryURI:(NSString*)libraryURI
       initialRoute:(NSString*)initialRoute {
  if (_shell != nullptr) {
    FML_LOG(WARNING) << "This FlutterEngine was already invoked.";
    return NO;
  }
  // 设置初始化路由
  self.initialRoute = initialRoute;

  auto settings = [_dartProject.get() settings];
  if (initialRoute != nil) {
    self.initialRoute = initialRoute;
  } else if (settings.route.empty() == false) {
    self.initialRoute = [NSString stringWithCString:settings.route.c_str()
                                           encoding:NSUTF8StringEncoding];
  }

  FlutterView.forceSoftwareRendering = settings.enable_software_rendering;

  auto platformData = [_dartProject.get() defaultPlatformData];

  SetEntryPoint(&settings, entrypoint, libraryURI);
  // 初始化 _threadHost
  NSString* threadLabel = [FlutterEngine generateThreadLabel:_labelPrefix];
  _threadHost = std::make_shared<flutter::ThreadHost>();
  *_threadHost = [FlutterEngine makeThreadHost:threadLabel];

  // Lambda captures by pointers to ObjC objects are fine here because the
  // create call is synchronous.
  // 设置 on_create_platform_view 回调
  flutter::Shell::CreateCallback<flutter::PlatformView> on_create_platform_view =
      [self](flutter::Shell& shell) {
        [self recreatePlatformViewController];
        return std::make_unique<flutter::PlatformViewIOS>(
            shell, self->_renderingApi, self->_platformViewsController, shell.GetTaskRunners());
      };
  // 设置 on_create_rasterizer 回调
  flutter::Shell::CreateCallback<flutter::Rasterizer> on_create_rasterizer =
      [](flutter::Shell& shell) { return std::make_unique<flutter::Rasterizer>(shell); };
  // 初始化 TaskRunners
  // engine 启动了四个 task runner platform、raster、ui、io，但并不一定对应四个线程
  flutter::TaskRunners task_runners(threadLabel.UTF8String,                          // label
                                    fml::MessageLoop::GetCurrent().GetTaskRunner(),  // platform
                                    _threadHost->raster_thread->GetTaskRunner(),     // raster
                                    _threadHost->ui_thread->GetTaskRunner(),         // ui
                                    _threadHost->io_thread->GetTaskRunner()          // io
  );

  _isGpuDisabled =
      [UIApplication sharedApplication].applicationState == UIApplicationStateBackground;
  // Create the shell. This is a blocking operation.
  // 创建 shell
  std::unique_ptr<flutter::Shell> shell = flutter::Shell::Create(
      /*platform_data=*/std::move(platformData),
      /*task_runners=*/std::move(task_runners),
      /*settings=*/std::move(settings),
      /*on_create_platform_view=*/on_create_platform_view,
      /*on_create_rasterizer=*/on_create_rasterizer,
      /*is_gpu_disabled=*/_isGpuDisabled);

  if (shell == nullptr) {
    FML_LOG(ERROR) << "Could not start a shell FlutterEngine with entrypoint: "
                   << entrypoint.UTF8String;
  } else {
    // 启动 isolate
    [self setupShell:std::move(shell)
        withObservatoryPublication:settings.enable_observatory_publication];
    if ([FlutterEngine isProfilerEnabled]) {
      [self startProfiler];
    }
  }

  return _shell != nullptr;
}
```

启动 Engine，代码实现调用 shell 的 RunEngine 方法

```objectivec
- (void)launchEngine:(NSString*)entrypoint
          libraryURI:(NSString*)libraryOrNil
      entrypointArgs:(NSArray<NSString*>*)entrypointArgs {
  // Launch the Dart application with the inferred run configuration.
  self.shell.RunEngine([_dartProject.get() runConfigurationForEntrypoint:entrypoint
                                                            libraryOrNil:libraryOrNil
                                                          entrypointArgs:entrypointArgs]);
}

void Shell::RunEngine(RunConfiguration run_configuration) {
  RunEngine(std::move(run_configuration), nullptr);
}

void Shell::RunEngine(
    RunConfiguration run_configuration,
    const std::function<void(Engine::RunStatus)>& result_callback) {
  auto result = [platform_runner = task_runners_.GetPlatformTaskRunner(),
                 result_callback](Engine::RunStatus run_result) {
    if (!result_callback) {
      return;
    }
    platform_runner->PostTask(
        [result_callback, run_result]() { result_callback(run_result); });
  };
  FML_DCHECK(is_setup_);
  FML_DCHECK(task_runners_.GetPlatformTaskRunner()->RunsTasksOnCurrentThread());

  fml::TaskRunner::RunNowOrPostTask(
      task_runners_.GetUITaskRunner(),
      fml::MakeCopyable(
          [run_configuration = std::move(run_configuration),
           weak_engine = weak_engine_, result]() mutable {
            if (!weak_engine) {
              FML_LOG(ERROR)
                  << "Could not launch engine with configuration - no engine.";
              result(Engine::RunStatus::Failure);
              return;
            }
            // 启动 engine
            auto run_result = weak_engine->Run(std::move(run_configuration));
            if (run_result == flutter::Engine::RunStatus::Failure) {
              FML_LOG(ERROR) << "Could not launch engine with configuration.";
            }
            result(run_result);
          }));
}

```

核心实现为 engine.cc 里的 `weak_engine->Run(std::move(run_configuration))`，最终启动 isolate。

```objectivec
Engine::RunStatus Engine::Run(RunConfiguration configuration) {
  if (!configuration.IsValid()) {
    FML_LOG(ERROR) << "Engine run configuration was invalid.";
    return RunStatus::Failure;
  }

  last_entry_point_ = configuration.GetEntrypoint();
  last_entry_point_library_ = configuration.GetEntrypointLibrary();
#if (FLUTTER_RUNTIME_MODE == FLUTTER_RUNTIME_MODE_DEBUG)
  // This is only used to support restart.
  last_entry_point_args_ = configuration.GetEntrypointArgs();
#endif

  UpdateAssetManager(configuration.GetAssetManager());

  if (runtime_controller_->IsRootIsolateRunning()) {
    return RunStatus::FailureAlreadyRunning;
  }

  // If the embedding prefetched the default font manager, then set up the
  // font manager later in the engine launch process.  This makes it less
  // likely that the setup will need to wait for the prefetch to complete.
  auto root_isolate_create_callback = [&]() {
    if (settings_.prefetched_default_font_manager) {
      SetupDefaultFontManager();
    }
  };
  // 启动 root isolate
  if (!runtime_controller_->LaunchRootIsolate(
          settings_,                                 //
          root_isolate_create_callback,              //
          configuration.GetEntrypoint(),             //
          configuration.GetEntrypointLibrary(),      //
          configuration.GetEntrypointArgs(),         //
          configuration.TakeIsolateConfiguration())  //
  ) {
    return RunStatus::Failure;
  }
  // 获取 isolate id
  auto service_id = runtime_controller_->GetRootIsolateServiceID();
  if (service_id.has_value()) {
    std::unique_ptr<PlatformMessage> service_id_message =
        std::make_unique<flutter::PlatformMessage>(
            kIsolateChannel, MakeMapping(service_id.value()), nullptr);
    HandlePlatformMessage(std::move(service_id_message));
  }

  return Engine::RunStatus::Success;
}
```

调用 ` runtime_controller``LaunchRootIsolate ` 方法 `CreateRunningRootIsolate` 创建并启动 `isolate`

```objectivec
bool RuntimeController::LaunchRootIsolate(
    const Settings& settings,
    fml::closure root_isolate_create_callback,
    std::optional<std::string> dart_entrypoint,
    std::optional<std::string> dart_entrypoint_library,
    const std::vector<std::string>& dart_entrypoint_args,
    std::unique_ptr<IsolateConfiguration> isolate_configuration) {
  if (root_isolate_.lock()) {
    FML_LOG(ERROR) << "Root isolate was already running.";
    return false;
  }

  auto strong_root_isolate =
      DartIsolate::CreateRunningRootIsolate(
          settings,                                       //
          isolate_snapshot_,                              //
          std::make_unique<PlatformConfiguration>(this),  //
          DartIsolate::Flags{},                           //
          root_isolate_create_callback,                   //
          isolate_create_callback_,                       //
          isolate_shutdown_callback_,                     //
          dart_entrypoint,                                //
          dart_entrypoint_library,                        //
          dart_entrypoint_args,                           //
          std::move(isolate_configuration),               //
          context_,                                       //
          spawning_isolate_.lock().get())                 //
          .lock();

  if (!strong_root_isolate) {
    FML_LOG(ERROR) << "Could not create root isolate.";
    return false;
  }

  // The root isolate ivar is weak.
  root_isolate_ = strong_root_isolate;

  // Capture by `this` here is safe because the callback is made by the dart
  // state itself. The isolate (and its Dart state) is owned by this object and
  // it will be collected before this object.
  strong_root_isolate->SetReturnCodeCallback(
      [this](uint32_t code) { root_isolate_return_code_ = code; });

  if (auto* platform_configuration = GetPlatformConfigurationIfAvailable()) {
    tonic::DartState::Scope scope(strong_root_isolate);
    platform_configuration->DidCreateIsolate();
    if (!FlushRuntimeStateToIsolate()) {
      FML_DLOG(ERROR) << "Could not set up initial isolate state.";
    }
  } else {
    FML_DCHECK(false) << "RuntimeController created without window binding.";
  }

  FML_DCHECK(Dart_CurrentIsolate() == nullptr);

  client_.OnRootIsolateCreated();

  return true;
}
```

**创建并启动 isolate**

- CreateRootIsolate
- RunFromLibrary

```objectivec
std::weak_ptr<DartIsolate> DartIsolate::CreateRunningRootIsolate(
    const Settings& settings,
    fml::RefPtr<const DartSnapshot> isolate_snapshot,
    std::unique_ptr<PlatformConfiguration> platform_configuration,
    Flags isolate_flags,
    fml::closure root_isolate_create_callback,
    const fml::closure& isolate_create_callback,
    const fml::closure& isolate_shutdown_callback,
    std::optional<std::string> dart_entrypoint,
    std::optional<std::string> dart_entrypoint_library,
    const std::vector<std::string>& dart_entrypoint_args,
    std::unique_ptr<IsolateConfiguration> isolate_configuration,
    const UIDartState::Context& context,
    const DartIsolate* spawning_isolate) {
  if (!isolate_snapshot) {
    FML_LOG(ERROR) << "Invalid isolate snapshot.";
    return {};
  }

  if (!isolate_configuration) {
    FML_LOG(ERROR) << "Invalid isolate configuration.";
    return {};
  }

  isolate_flags.SetNullSafetyEnabled(
      isolate_configuration->IsNullSafetyEnabled(*isolate_snapshot));
  isolate_flags.SetIsDontNeedSafe(isolate_snapshot->IsDontNeedSafe());

  auto isolate = CreateRootIsolate(settings,                           //
                                   isolate_snapshot,                   //
                                   std::move(platform_configuration),  //
                                   isolate_flags,                      //
                                   isolate_create_callback,            //
                                   isolate_shutdown_callback,          //
                                   context,                            //
                                   spawning_isolate                    //
                                   )
                     .lock();

  if (!isolate) {
    FML_LOG(ERROR) << "Could not create root isolate.";
    return {};
  }

  fml::ScopedCleanupClosure shutdown_on_error([isolate]() {
    if (!isolate->Shutdown()) {
      FML_DLOG(ERROR) << "Could not shutdown transient isolate.";
    }
  });

  if (isolate->GetPhase() != DartIsolate::Phase::LibrariesSetup) {
    FML_LOG(ERROR) << "Root isolate was created in an incorrect phase: "
                   << static_cast<int>(isolate->GetPhase());
    return {};
  }

  if (!isolate_configuration->PrepareIsolate(*isolate.get())) {
    FML_LOG(ERROR) << "Could not prepare isolate.";
    return {};
  }

  if (isolate->GetPhase() != DartIsolate::Phase::Ready) {
    FML_LOG(ERROR) << "Root isolate not in the ready phase for Dart entrypoint "
                      "invocation.";
    return {};
  }

  if (settings.root_isolate_create_callback) {
    // Isolate callbacks always occur in isolate scope and before user code has
    // had a chance to run.
    tonic::DartState::Scope scope(isolate.get());
    settings.root_isolate_create_callback(*isolate.get());
  }

  if (root_isolate_create_callback) {
    root_isolate_create_callback();
  }

  if (!isolate->RunFromLibrary(dart_entrypoint_library,  //
                               dart_entrypoint,          //
                               dart_entrypoint_args)) {
    FML_LOG(ERROR) << "Could not run the run main Dart entrypoint.";
    return {};
  }

  if (settings.root_isolate_shutdown_callback) {
    isolate->AddIsolateShutdownCallback(
        settings.root_isolate_shutdown_callback);
  }

  shutdown_on_error.Release();

  return isolate;
}

// 1. CreateRootIsolate
std::weak_ptr<DartIsolate> DartIsolate::CreateRootIsolate(
    const Settings& settings,
    fml::RefPtr<const DartSnapshot> isolate_snapshot,
    std::unique_ptr<PlatformConfiguration> platform_configuration,
    Flags flags,
    const fml::closure& isolate_create_callback,
    const fml::closure& isolate_shutdown_callback,
    const UIDartState::Context& context,
    const DartIsolate* spawning_isolate) {
  TRACE_EVENT0("flutter", "DartIsolate::CreateRootIsolate");

  // The child isolate preparer is null but will be set when the isolate is
  // being prepared to run.
  auto isolate_group_data =
      std::make_unique<std::shared_ptr<DartIsolateGroupData>>(
          std::shared_ptr<DartIsolateGroupData>(new DartIsolateGroupData(
              settings,                            // settings
              std::move(isolate_snapshot),         // isolate snapshot
              context.advisory_script_uri,         // advisory URI
              context.advisory_script_entrypoint,  // advisory entrypoint
              nullptr,                             // child isolate preparer
              isolate_create_callback,             // isolate create callback
              isolate_shutdown_callback            // isolate shutdown callback
              )));

  auto isolate_data = std::make_unique<std::shared_ptr<DartIsolate>>(
      std::shared_ptr<DartIsolate>(new DartIsolate(
          settings,           // settings
          true,               // is_root_isolate
          std::move(context)  // context
          )));

  DartErrorString error;
  Dart_Isolate vm_isolate = nullptr;
  auto isolate_flags = flags.Get();

  IsolateMaker isolate_maker;
  if (spawning_isolate) {
    isolate_maker = [spawning_isolate](
                        std::shared_ptr<DartIsolateGroupData>*
                            isolate_group_data,
                        std::shared_ptr<DartIsolate>* isolate_data,
                        Dart_IsolateFlags* flags, char** error) {
      return Dart_CreateIsolateInGroup(
          /*group_member=*/spawning_isolate->isolate(),
          /*name=*/(*isolate_group_data)->GetAdvisoryScriptEntrypoint().c_str(),
          /*shutdown_callback=*/
          reinterpret_cast<Dart_IsolateShutdownCallback>(
              DartIsolate::SpawnIsolateShutdownCallback),
          /*cleanup_callback=*/
          reinterpret_cast<Dart_IsolateCleanupCallback>(
              DartIsolateCleanupCallback),
          /*child_isolate_data=*/isolate_data,
          /*error=*/error);
    };
  } else {
    isolate_maker = [](std::shared_ptr<DartIsolateGroupData>*
                           isolate_group_data,
                       std::shared_ptr<DartIsolate>* isolate_data,
                       Dart_IsolateFlags* flags, char** error) {
      return Dart_CreateIsolateGroup(
          (*isolate_group_data)->GetAdvisoryScriptURI().c_str(),
          (*isolate_group_data)->GetAdvisoryScriptEntrypoint().c_str(),
          (*isolate_group_data)->GetIsolateSnapshot()->GetDataMapping(),
          (*isolate_group_data)->GetIsolateSnapshot()->GetInstructionsMapping(),
          flags, isolate_group_data, isolate_data, error);
    };
  }

  vm_isolate = CreateDartIsolateGroup(std::move(isolate_group_data),
                                      std::move(isolate_data), &isolate_flags,
                                      error.error(), isolate_maker);

  if (error) {
    FML_LOG(ERROR) << "CreateRootIsolate failed: " << error.str();
  }

  if (vm_isolate == nullptr) {
    return {};
  }

  std::shared_ptr<DartIsolate>* root_isolate_data =
      static_cast<std::shared_ptr<DartIsolate>*>(Dart_IsolateData(vm_isolate));

  (*root_isolate_data)
      ->SetPlatformConfiguration(std::move(platform_configuration));

  return (*root_isolate_data)->GetWeakIsolatePtr();
}

// 2. RunFromLibrary
bool DartIsolate::RunFromLibrary(std::optional<std::string> library_name,
                                 std::optional<std::string> entrypoint,
                                 const std::vector<std::string>& args) {
  TRACE_EVENT0("flutter", "DartIsolate::RunFromLibrary");
  if (phase_ != Phase::Ready) {
    return false;
  }

  tonic::DartState::Scope scope(this);

  auto library_handle =
      library_name.has_value() && !library_name.value().empty()
          ? ::Dart_LookupLibrary(tonic::ToDart(library_name.value().c_str()))
          : ::Dart_RootLibrary();
  // 查找 entrypoint
  auto entrypoint_handle = entrypoint.has_value() && !entrypoint.value().empty()
                               ? tonic::ToDart(entrypoint.value().c_str())
                               : tonic::ToDart("main");

  if (!FindAndInvokeDartPluginRegistrant()) {
    // TODO(gaaclarke): Remove once the framework PR lands that uses `--source`
    // to compile the Dart Plugin Registrant
    // (https://github.com/flutter/flutter/pull/100572).
    InvokeDartPluginRegistrantIfAvailable(library_handle);
  }

  auto user_entrypoint_function =
      ::Dart_GetField(library_handle, entrypoint_handle);

  auto entrypoint_args = tonic::ToDart(args);
 // 调用 entrypoint 的函数，InvokeMainEntrypoint
  if (!InvokeMainEntrypoint(user_entrypoint_function, entrypoint_args)) {
    return false;
  }

  phase_ = Phase::Running;

  return true;
}

// 1. start_main_isolate_function
// 2. _runMainZoned
[[nodiscard]] static bool InvokeMainEntrypoint(
    Dart_Handle user_entrypoint_function,
    Dart_Handle args) {
  if (tonic::LogIfError(user_entrypoint_function)) {
    FML_LOG(ERROR) << "Could not resolve main entrypoint function.";
    return false;
  }

  Dart_Handle start_main_isolate_function =
      tonic::DartInvokeField(Dart_LookupLibrary(tonic::ToDart("dart:isolate")),
                             "_getStartMainIsolateFunction", {});

  if (tonic::LogIfError(start_main_isolate_function)) {
    FML_LOG(ERROR) << "Could not resolve main entrypoint trampoline.";
    return false;
  }

  if (tonic::LogIfError(tonic::DartInvokeField(
          Dart_LookupLibrary(tonic::ToDart("dart:ui")), "_runMainZoned",
          {start_main_isolate_function, user_entrypoint_function, args}))) {
    FML_LOG(ERROR) << "Could not invoke the main entrypoint.";
    return false;
  }

  return true;
}

```

由上面代码可以看出 `engine` 启动的整个流程，如下图所示：

![](/assets/flutter/flutter_source_1/045d7d2bf527.jpeg)

> 在 FlutterEngine 创建 shell 时会创建 UI Task Runner、Platform Task Runne、IO Task Runner 及 Raster Task Runner 这四个 Task Runner，每个 Runner 分别会处理其对应的任务

`thread_host` 创建线程，负责不同的工作

```objectivec
ThreadHost::ThreadHost(const ThreadHostConfig& host_config)
    : name_prefix(host_config.name_prefix) {
  if (host_config.isThreadNeeded(ThreadHost::Type::Platform)) {
    platform_thread =
        CreateThread(Type::Platform, host_config.platform_config, host_config);
  }

  if (host_config.isThreadNeeded(ThreadHost::Type::UI)) {
    ui_thread = CreateThread(Type::UI, host_config.ui_config, host_config);
  }

  if (host_config.isThreadNeeded(ThreadHost::Type::RASTER)) {
    raster_thread =
        CreateThread(Type::RASTER, host_config.raster_config, host_config);
  }

  if (host_config.isThreadNeeded(ThreadHost::Type::IO)) {
    io_thread = CreateThread(Type::IO, host_config.io_config, host_config);
  }

  if (host_config.isThreadNeeded(ThreadHost::Type::Profiler)) {
    profiler_thread =
        CreateThread(Type::Profiler, host_config.profiler_config, host_config);
  }
}
```

![](/assets/flutter/flutter_source_1/9c7f00f72bb1.jpeg)

### FlutterView 源码解析

`FlutterView` 并没有太多功能，主要是两点：

- 初始化时传入 `FlutterViewEngineDelegate`
- 创建 `flutter::drawLayer`

实际上，从 `FlutterViewController` 代码创建的 `FlutterView`，可以看出实际上 `FlutterViewEngineDelegate` 是由 `FlutterEngine` 实现的。

```objectivec
_flutterView.reset([[FlutterView alloc] initWithDelegate:_engine opaque:self.isViewOpaque]);
```

```objectivec
@protocol FlutterViewEngineDelegate <NSObject>

- (flutter::Rasterizer::Screenshot)takeScreenshot:(flutter::Rasterizer::ScreenshotType)type
                                  asBase64Encoded:(BOOL)base64Encode;

- (std::shared_ptr<flutter::FlutterPlatformViewsController>&)platformViewsController;

/**
 * A callback that is called when iOS queries accessibility information of the Flutter view.
 *
 * This is useful to predict the current iOS accessibility status. For example, there is
 * no API to listen whether voice control is turned on or off. The Flutter engine uses
 * this callback to enable semantics in order to catch the case that voice control is
 * on.
 */
- (void)flutterViewAccessibilityDidCall;
@end
```

```objectivec
// 根据设备及系统版本决定用那种渲染 API 实现，CALayer/CAEAGLLayer/CAMetalLayer
+ (Class)layerClass {
  return flutter::GetCoreAnimationLayerClassForRenderingAPI(
      flutter::GetRenderingAPIForProcess(FlutterView.forceSoftwareRendering));
}

- (void)drawLayer:(CALayer*)layer inContext:(CGContextRef)context {
  TRACE_EVENT0("flutter", "SnapshotFlutterView");

  if (layer != self.layer || context == nullptr) {
    return;
  }
  // 获取 Flutter 渲染的数据源
  auto screenshot = [_delegate takeScreenshot:flutter::Rasterizer::ScreenshotType::UncompressedImage
                              asBase64Encoded:NO];

  if (!screenshot.data || screenshot.data->isEmpty() || screenshot.frame_size.isEmpty()) {
    return;
  }

  NSData* data = [NSData dataWithBytes:const_cast<void*>(screenshot.data->data())
                                length:screenshot.data->size()];

  fml::CFRef<CGDataProviderRef> image_data_provider(
      CGDataProviderCreateWithCFData(reinterpret_cast<CFDataRef>(data)));

  fml::CFRef<CGColorSpaceRef> colorspace(CGColorSpaceCreateDeviceRGB());

  fml::CFRef<CGImageRef> image(CGImageCreate(
      screenshot.frame_size.width(),      // size_t width
      screenshot.frame_size.height(),     // size_t height
      8,                                  // size_t bitsPerComponent
      32,                                 // size_t bitsPerPixel,
      4 * screenshot.frame_size.width(),  // size_t bytesPerRow
      colorspace,                         // CGColorSpaceRef space
      static_cast<CGBitmapInfo>(kCGImageAlphaPremultipliedLast |
                                kCGBitmapByteOrder32Big),  // CGBitmapInfo bitmapInfo
      image_data_provider,                                 // CGDataProviderRef provider
      nullptr,                                             // const CGFloat* decode
      false,                                               // bool shouldInterpolate
      kCGRenderingIntentDefault                            // CGColorRenderingIntent intent
      ));

  const CGRect frame_rect =
      CGRectMake(0.0, 0.0, screenshot.frame_size.width(), screenshot.frame_size.height());

  CGContextSaveGState(context);
  CGContextTranslateCTM(context, 0.0, CGBitmapContextGetHeight(context));
  CGContextScaleCTM(context, 1.0, -1.0);
  CGContextDrawImage(context, frame_rect, image);
  CGContextRestoreGState(context);
}
```

```objectivec
IOSRenderingAPI GetRenderingAPIForProcess(bool force_software) {
#if TARGET_OS_SIMULATOR // 模拟器使用 CALayer
  if (force_software) {
    return IOSRenderingAPI::kSoftware;
  }
#else
  if (force_software) {
    FML_LOG(WARNING) << "The --enable-software-rendering is only supported on Simulator targets "
                        "and will be ignored.";
  }
#endif  // TARGET_OS_SIMULATOR

#if SHELL_ENABLE_METAL // 如果可以使用 Metal 则使用 CAMetalLayer
  static bool should_use_metal = ShouldUseMetalRenderer();
  if (should_use_metal) {
    return IOSRenderingAPI::kMetal;
  }
#endif  // SHELL_ENABLE_METAL

  // OpenGL will be emulated using software rendering by Apple on the simulator, so we use the
  // Skia software rendering since it performs a little better than the emulated OpenGL.
#if TARGET_OS_SIMULATOR
  return IOSRenderingAPI::kSoftware;
#else // 真机并且不使用 Metal，则默认使用 OpenGL ES CAEAGLLayer
  return IOSRenderingAPI::kOpenGLES;
#endif  // TARGET_OS_SIMULATOR
}

```

由此可见，`FlutterVIew` 其实就是提供了一个画布来显示渲染的内容，具体详细的渲染是由 `FlutterEngine` 来实现。

## 总结

Flutter 运行于 iOS 之上，从源码层面看，总结如下：

- 复用了现有的三类 `CALayer` 来绘制界面，`drawLayer` 时会调用 `takeScreenshot` 来获取 Flutter 界面的光栅图。
- Flutter 自身会创建一个完全独立的线程环境来运行，我们需要关注的是四个 TaskRunner，UI Task Runner、Platform Task Runner、Raster Task Runner、IO Task Runner。
- Platform Task Runner，原生端跟 Flutter 的所有交互都会在 Platform Task Runner 进行处理。
- `FlutterViewController` 将所有的手势交互相关的都转发给 `FlutterEngine` 。

### Flutter 运行流程

为了验证整个运行流程，我分别在上面所提到的一些方法设置断点进行调试，如下所示：

![image.png](/assets/flutter/flutter_source_1/81975fcba845.png)

断点流程如下所示：
![0 Thread 1 Queue com.apple.main-thread (serial).png](/assets/flutter/flutter_source_1/0d012995e5a6.png)

![0 Thread Queue com.apple.main-thread (serial).png](/assets/flutter/flutter_source_1/fbc41308c282.png)

![Thread 1 Queue com.apple.main-thread (serial).png](/assets/flutter/flutter_source_1/6edb37de24a3.png)

![image.png](/assets/flutter/flutter_source_1/e922db657ce3.png)

![image.png](/assets/flutter/flutter_source_1/3448d325785f.png)

*对整个 Flutter 运行的流程可以大致总结如下，主要是侧重在引擎侧，仅供参考：*

- 创建 FlutterViewController
- 创建 FlutterView、创建 FlutterEngine
- 创建 shell
- 创建 Dart VM
- 寻找 DartLibrary
- 定位到 Entrypoint
- 创建 engine，传入 DartLibrary 和 Entrypoint
- RuntimeController LaunchRootIsolate 创建 isolate
- 启动 engine、 Dart VM
- 加载 DartLibrary，运行 dart 的 Entrypoint
- 截取 Dart UI 的界面并光栅化并绘制到 CALayer/CAMetalLayer/CAEAGLLayer
