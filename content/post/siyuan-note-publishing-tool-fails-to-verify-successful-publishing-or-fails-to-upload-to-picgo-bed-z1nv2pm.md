---
title: 思源笔记发布工具验证成功发布失败或Picgo图床上传失败
slug: >-
  siyuan-note-publishing-tool-fails-to-verify-successful-publishing-or-fails-to-upload-to-picgo-bed-z1nv2pm
url: >-
  /post/siyuan-note-publishing-tool-fails-to-verify-successful-publishing-or-fails-to-upload-to-picgo-bed-z1nv2pm.html
date: '2025-11-06 01:26:26+08:00'
lastmod: '2025-11-06 01:59:44+08:00'
tags:
  - 思源笔记
  - 插件
  - 程序问题
categories:
  - 图文教程
  - 配置经验
keywords: 思源笔记,插件,程序问题
description: >-
  本文解决思源笔记发布工具与PicGo图床插件的常见配置问题。当发布配置授权成功但发布失败时，需检查思源笔记设置中的图床地址与Token是否与发布工具配置一致，确保无拼写错误（如`errot`应为`error`）。若出现401鉴权失败，说明Token无效或地址错误，需重新核对并同步设置。对于PicGo图床插件，同样需确认配置参数正确性，因作者相同且配置逻辑相似，解决方式与思源笔记发布工具一致。关键步骤包括：检查Token有效性、地址准确性，以及开发者工具中的错误提示，确保所有配置项统一匹配。
toc: true
isCJKLanguage: true
---



![image](assets/31e10877-6e2e-4404-ab04-e8bee6073337-20251106013011-484qkr7.png)

# 思源笔记发布工具验证成功发布失败或Picgo图床上传失败

## **问题：发布配置授权成功，但是发布反复失败 无法发布**

### **前提：** 在发布工具的配置中已成功

![image](https://s2.loli.net/2025/11/06/xmNf5893K47TqpL.png)

### 现象：

打开**开发者工具**后

重新进行发布流程，弹出提示：

![31e10877-6e2e-4404-ab04-e8bee6073337](assets/31e10877-6e2e-4404-ab04-e8bee6073337-20251106013011-484qkr7.png " © 操作失败=>TypeError: this.logger.errot is not a function ")

![image](https://s2.loli.net/2025/11/06/Klg8ImQt9FO6DXT.png "发布到[]失败!详细错误 操作耗时:0 ms")

开发者工具中显示401鉴权失败

![image](https://s2.loli.net/2025/11/06/JsCWRFbEvTjB2I8.png)

说明token设置错误

### 解决：

1. 打开siyuan设置

![a8c66321-4b21-4f86-bce2-e1e9ee45d6b8](https://s2.loli.net/2025/11/06/LOyxwFD2zjSc3ql.png)

![a9ce9a22-1ef4-4f34-866a-59bcb06c54ff](https://s2.loli.net/2025/11/06/5Mc6WHYfUkzhx8j.png)

2. 打开 **发布工具 通用设置 偏好设置**  设置正确的地址和Token与上面的思源设置一致

![image](https://s2.loli.net/2025/11/06/Q8mfTW65JVn7wcG.png)

3. 即可发布成功

## 问题：PicGo图床 图床配置成功上传报错

PicGo图床插件为同一作者 使用类似配置思路

![image](https://s2.loli.net/2025/11/06/aAGyU87tVpnCDZw.png)

解决方式同上
