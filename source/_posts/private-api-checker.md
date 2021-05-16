---
title: iOS-private-api-checker私有API检测工具使用详细步骤
date: 2018-04-02 
tags:
    - iOS
---
### iOS-private-api-checker私有API检查详细步骤（涉及到 Python、Flask、sqlite 环境）

1、下载iOS-private-api-checker-master https://github.com/hustcc/iOS-private-api-checker

2、下载已经build好的ios_private.db库(本人能力有限，不会build，这个是大神build好的，sdk7.0版本，不是最新的，所以有些私有库查不出来(PS: 或者有些已经公开的库检测为私有库！！详情请看上面的链接，github上有教程，写这篇文章主要是想尝试一下如何使用这个工具，准确性不敢保证)，github上有教程，有能力的可以自己build^^)，将 ios_private.db 放入到项目的根目录，主要修改可写权限；

（备注：ios_private.db 下载地址： 链接: https://pan.baidu.com/s/1d7YlSa 密码: fimx）

<!--more-->
3、在根目录创建一个 tmp 目录（如果没有的话，注意修改可写权限），或者将tmp的文件夹的权限设置为777，先进terminal，然后输入Wally的命令，后面添加你的目录名。
``` bash
$ sudo chmod -R 777 目录名
```
 4、在终端输入sqlite3 , 出现这个表示已经安装了sqlite，没有则参考 http://www.runoob.com/sqlite/sqlite-installation.html 进行安装

##### 安装sqlite

5、配置flask环境

5.1 Mac系统已经默认安装好了Python 2.7

5.2 安装python的包管理器pip ，先下载 get-pip.py ： https://bootstrap.pypa.io/get-pip.py

执行安装命令
``` bash
$ sudo python get-pip.py
```
5.3 安装virtualenv，virtualenv 为每个不同项目提供一份 Python 安装。它并没有真正安装多个 Python 副本，但是它确实提供了一种巧妙的方式来让各项目环境保持独立。
``` bash
$ sudo pip install virtualenv
```
5.4 开始配置flask环境

``` bash
进到项目目录
$ cd 项目路径
创建flask文件夹
$ virtualenv flask
$ cd flask
激活环境
$ source bin/activate
安装flask
$ pip install flask
回到根目录
$ cd -
```
6 、安装 macholib
``` bash
$ pip install macholib
```
7、最后运行 run_web（或者 ）
``` bash
$ python run_web.py
```
在浏览器中输入127.0.0.1:9527 将ipa拖入上传框等待即可看到检查结果
![检查结果.png](/assets/img/checker_upload.png)


