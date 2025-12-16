---
title: 安卓手机短信同步到平板的简便方法
slug: sync-text-messages-from-android-phone-to-tablet-1rbs5w
url: /post/sync-text-messages-from-android-phone-to-tablet-1rbs5w.html
date: '2025-12-16 18:04:30+08:00'
lastmod: '2025-12-16 19:09:34+08:00'
tags:
  - 多设备
  - 同步
  - 应用安利
  - 安卓
categories:
  - 图文教程
keywords: 多设备,同步,应用安利,安卓
description: >-
  本文介绍了如何将安卓手机的短信同步到平板电脑上，通过使用NotifyMe应用作为接收端，以及SmsForwarder作为发送端来实现短信的跨设备推送。首先，在接收端安装NotifyMe，并根据提示生成UUID，然后创建包含该UUID的推送链接。接着，在发送端（安卓手机）安装SmsForwarder应用，配置URL
  Schema通道，将短信内容通过指定链接转发至接收端。用户需要在发送端设置转发规则，选择对应的短信通道和目标接收端，以确保短信能够正确地推送到平板。整个过程涉及到权限管理、通道添加和规则设定等步骤，旨在实现便捷的短信跨设备同步功能。
toc: true
isCJKLanguage: true
---



# 安卓手机短信同步到平板

（以安卓平板为例 ios换个app也能用）

## 接收端配置📱(可安卓可苹果)

接收端需安装**NotifyMe**应用（iOS系统安装bark）。

**NotifyMe** （Android）

![image](/images/image-20251216190626-mhc6m85.png)

主页和帮助： [Material for MkDocs - NotifyMe Tutorials](https://notifyme.521933.xyz/index.html)

下载链接：[Material for MkDocs - NotifyMe Tutorials](https://notifyme.521933.xyz/download.html)

***Bark  (IOS)***

主页和帮助： *[Bark](https://bark.day.app/#/)*

‍

**NotifyMe 配置：**

选择需要形成推送的类型，通用类型为谷歌型。

然后利用生成的 **UUID** 来创建目标链接：

```vb
https://notifyme-server.wzn556.top/?uuid=[替换成接收端notifyme的uuid]&title=填入消息的标题&body=填入消息的内容&group=填入消息的分组&bigText=false
```

（文字需替换）

## 发送端配置📤(安卓)

![image](/images/image-20251216184348-svgy9rv.png)

### 1. 应用安装

安装短信转发器应用（**SmsForwarder**），可通过以下链接获取：

```vb
https://github.com/pppscn/SmsForwarder
```

**SmsForwarder v3.3.3 免费开源4周年纪念版**

```vb
https://github.com/pppscn/SmsForwarder/releases/download/v3.3.3/SmsF_3.3.3.250214_100054_universal_release.apk
```

### 2. 通用设置

在 短信转发器应用中 开启短信转发功能等，具体需根据手机系统进行专门设置。

例如OPPO ColorOS系统：在多任务视图中找到该应用图标，进入应用详情，选择权限管理，点击右上角三个点，解除相关限制权限（因为我接触限制后就没有这个选项了，所以这个选项的名字可能不完全正确）

### 3. 添加通道

添加URL Schema通道（用于设定指向目标地址的路径）。

• 通道名称：为该路径命名，可直接使用设备代称。

• URL：

```vb
https://notifyme-server.wzn556.top/?uuid=【替换成接收端notifyme的uuid】=【来自XX的短信】&body=[msg]&group=【分组名】&bigText=false
```

其中，body=[msg]表示让应用将收到的通知内容作为body部分发送。

【？】包裹的部分需要替换成对应的内容，也可以为空

*如果接收端是bark则会有对应的链接，基本逻辑一致*

### 4. 转发规则

用于设定发送端需要将哪些通知转发给接收端。在此处添加短信转发规则，选择发送通道，并下拉选择目标接收端。
