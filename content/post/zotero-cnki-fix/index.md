---
title: 使用Zotero解决知网仅保存快照的问题
description: 解决Zotero保存知网文献时只能保存快照的问题,完整教程
slug: zotero-cnki-fix
date: 2025-11-01 00:00:00+0000
image: assets/37abe810090a4b8b70a32cd68b7cd832-20251101013845-cn0ffkl.png
categories:
    - 科研工具/Zotero
    - 图文教程
tags:
    - Zotero
    - 知网
    - 文献管理
    - 问题解决
---
使用Zotero网页插件保存知网文献时总是报错?本文教你如何解决这个问题。

<!--more-->

## 问题描述

使用Zotero网页插件保存文献一直报错:

> 使用 CNKI 保存时发生错误。改为尝试用 DOI 保存。 使用 DOI 保存时发生错误。改为尝试用 Save as Webpage 保存。

## 解决方案

只需要刷新三个设置即可解决!

### 1. 更新Zotero内置转换器

进入 `Zotero设置 > 高级 > 杂项 >自动转换器及样式的更新 >立即更新`

![更新内置转换器](assets/e41a07fcc536dbe986afcb42495566e1-20251101013352-nh68u6s.png)

### 2. 更新茉莉花插件的中文转换器

进入 `Zotero设置 > 茉莉花 > 中文转换器设置 > 自动更新转换器 > 立即更新`

![更新茉莉花转换器](assets/bfed7be6253226495a2d3942819be9d7-20251101013531-y13qi6v.png)

### 3. 重置浏览器扩展的转换器

**步骤 A**: 打开浏览器扩展选项

在Chrome浏览器扩展栏 `右键Zotero Connector扩展图标 > 选项`

![打开扩展选项](assets/1dcc2111c56b5c6ff34d1d00ff7859b0-20251101013714-9hg9ah7.png)

**步骤 B**: 重置转换器

在选项设置页面中 `Advanced > Translators > Reset Translators`

![重置转换器](assets/37abe810090a4b8b70a32cd68b7cd832-20251101013845-cn0ffkl.png)

## 注意事项

- 完成第2步后建议重启浏览器和Zotero
- 如果完成3步还不行,可以尝试:
  - 重启Zotero和浏览器
  - 重复第3步操作

就OK了!现在应该可以正常保存知网文献了。

‍
