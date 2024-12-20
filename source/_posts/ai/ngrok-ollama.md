---
title: Ngrok + Ollama 部署 localhost 开源模型
date: 2024-12-20 15:26:12
tags:
    - AI
---

这篇文章主要是记录如何使用 ngrok 反向代理 ollama，本地部署，公网访问，实现与本地 ollama 聊天，可以比较多种开源模型返回结果，为了快速集成及使用，使用基于 ollama 实现100%本地化 RAG 应用 [chatollama](https://github.com/sugarforever/chat-ollama/tree/main) ，项目的实现原理可参考 [Youtube 教程](https://www.youtube.com/watch?v=x4qPdrgVb_Y) ；将 chatollama 部署在 docker 上，ngrok 实现反向代理 ollama 和 chatollama 端口，配置完成之后就能实现在外网访问我们的开源模型啦😄，PS：以下的操作都是基于 Mac 电脑执行的。

### **环境安装**
**ngrok** 
全球分布式的反向代理，可以加速我们的应用程序或网络服务，无论在何处运行它们，可以利用 ngrok 在公共的端点和本地运行的 web 服务器之间建立一个安全的通道，基于 ngrok 将本地运行的服务器映射到公共网络，从而能从公网访问。

注册 [ngrok](https://dashboard.ngrok.com/signup?ref=home-hero) (不支持 qq 邮箱)

![image.png](/assets/ai/ngrok_ollama/image%201.png)

安装 ngrok ，在终端执行以下命令

```bash
// 我这边安装的版本是 3.18.4，不同系统对版本兼容可能存在问题，建议跟我安装一样的版本
$ brew install ngrok
// 配置 token
$ ngrok config add-authtoken XXX
```

![image.png](/assets/ai/ngrok_ollama/image%202.png)

<!--more-->

**[chatollama](https://github.com/sugarforever/chat-ollama/tree/main) (实现完全本地化的 RAG 应用)**

RAG 框架，**Retrieval-Augmented Generation**（检索增强生成），RAG 是一种结合了 **信息检索**（retrieval）和 **生成式模型**（generation）的框架。其核心思想是：在生成回答或文本时，不仅依赖预训练的语言模型（如 GPT 等），还引入外部文档或数据库中的相关信息进行检索，增强生成内容的准确性和多样性。

`ollama` 帮助本地开发者使用开源大模型应用，使用 ollama-js 进行开发
`ChatOllama` 是一个基于 LLMs（大语言模型）的开源聊天机器人平台，支持多种语言模型，包括：
    - Ollama 服务模型
    - OpenAI
    - Azure OpenAI
    - Anthropic
    - Moonshot
    - Gemini
    - Groq
    
`ChatOllama` 支持多种聊天类型：
    - 与 LLMs 免费聊天
    - 基于知识库与 LLMs 聊天

`ChatOllama` 的功能列表：
    - Ollama 模型管理
    - 知识库管理
    - 聊天
    - 商业 LLMs API 密钥管理


```bash
// 下载 chat-ollama 项目到本地
$ git clone git@github.com:sugarforever/chat-ollama.git
```


<h4>docker</h4>
安装 docker 

<img src="/assets/ai/ngrok_ollama/image%203.png" width="800" alt="docker installation">

安装成功之后，登录启动 docker 桌面应用

<img src="/assets/ai/ngrok_ollama/image%204.png" width="800" alt="docker installation">

**docker 部署**
打开终端，进入 chatollama 项目路径

```bash
$ cd chatollama 
$ cp .env.example .env
// 安装依赖，用到了 google 的一些依赖库，终端需要设置环境变量
$ yarn install 
$ docker compose up
// 首次运行在 docker 上需要初始化 SQLite 数据库
$ docker compose exec chatollama npx prisma migrate dev

```

部署成功之后如下图所示，docker 容器内启动了 chatollma 应用，暂停和启动操作后续都可以直接在 docker 桌面应用上操作：

<img src="/assets/ai/ngrok_ollama/image%205.png" width="800" alt="docker installation">

<img src="/assets/ai/ngrok_ollama/image%206.png" width="800" alt="docker installation">

**ngrok 多个 隧道配置**
docker 项目启动本地的 ollama 服务器和 chatollama，可以通过访问 [http://localhost:11434/](http://localhost:11434/) ，确认 ollama 是否启动成功：

<img src="/assets/ai/ngrok_ollama/image%207.png" width="800" alt="docker installation">

访问 [http://localhost:3000/](http://localhost:3000/)，确认 chatollama 是否启动成功：

<img src="/assets/ai/ngrok_ollama/image%208.png" width="800" alt="docker installation">

如果以上验证都没问题了，这边可以开始使用 ngrok 设置反向代理，使用公网访问我们本地的服务器：
找到电脑安装的 ngrok.yml 配置文件，在设置 authtoken 的时候终端会返回其对应的路径，在 ngrok.yml 配置中添加以下配置，实现免费版本的 ngrok 代理多个端口功能：

```yml
// 在 ngrok.yml 文件中添加以下配置
tunnels:
  allama:
    addr: 11434
    proto: http
    request_header:
      add: ["Host: localhost:11434"]
  chatollama:
    addr: 3000
    proto: http
```

```shell
// 启动 ngrok 
$ ngrok start --all
```
<img src="/assets/ai/ngrok_ollama/image%209.png" width="800" alt="docker installation">

启动成功后可以在浏览器上访问  [https://c0e3-222-248-214-8.ngrok-free.app](https://c0e3-222-248-214-8.ngrok-free.app/)，点击 view site 则可成功进入 chatollama 网站：

<img src="/assets/ai/ngrok_ollama/image%2010.png" width="800" alt="docker installation">

<img src="/assets/ai/ngrok_ollama/image%2011.png" width="800" alt="docker installation">

访问 [https://87e0-222-248-214-8.ngrok-free.app](https://87e0-222-248-214-8.ngrok-free.app/) 验证 ollama 是否能访问成功，点击 view site, 显示 `Ollama is running`：

<img src="/assets/ai/ngrok_ollama/image%2012.png" width="800" alt="docker installation">

配置 ollama 服务，确保能正确下载配置模型，点击保存，这时候网站就能正常使用了，如果想要支持更多的模型则可以在设置里填上对应的 API Key 加载对应的模型

<img src="/assets/ai/ngrok_ollama/image%2013.png" width="800" alt="docker installation">

点击模型选项，搜索下载模型，ollama 网站上支持的模型均能下载

<img src="/assets/ai/ngrok_ollama/image%2014.png" width="800" alt="docker installation">

<img src="/assets/ai/ngrok_ollama/image%2015.png" width="800" alt="docker installation">

开启对话，选择想要的模型类型，这时候就能进行聊天啦，然后我们还能得到所有模型的回答，针对不同的答案我们就能进行垂直的对比啦，可以选择一个自己认为更好的答案：

<img src="/assets/ai/ngrok_ollama/image%2016.png" width="800" alt="docker installation">

<img src="/assets/ai/ngrok_ollama/image%2017.png" width="800" alt="docker installation">

以上所有就是如何部署 chatollama 项目，并使用 ngrok 进行反向代理，实现公网访问，在世界任何地方都能与 localhost 开源大模型聊天的详细教程。这个教程只是教我们如何使用，关于 chatollama RAG 应用的实现可以参考 [langchain 系列教程](https://github.com/sugarforever/LangChain-Tutorials) 以及网上的[视频教程 ](https://www.youtube.com/playlist?list=PL2fGiugrNoojftjcvaxJfsCEWqUEAPmve)

Reference:
[https://www.youtube.com/playlist?list=PL2fGiugrNoojftjcvaxJfsCEWqUEAPmve](https://www.youtube.com/playlist?list=PL2fGiugrNoojftjcvaxJfsCEWqUEAPmve)
[https://github.com/sugarforever/LangChain-Tutorials](https://github.com/sugarforever/LangChain-Tutorials)