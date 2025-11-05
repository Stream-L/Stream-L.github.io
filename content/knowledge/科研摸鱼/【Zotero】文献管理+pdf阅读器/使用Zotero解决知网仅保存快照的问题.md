---
title: "使用Zotero解决知网仅保存快照的问题"
description: 
slug: "forums-bookmarks"
date: 2025-11-05T00:00:00+08:00
image: 
math: false
license: 
hidden: false
comments: true
toc: true
draft: false
---
使用Zotero网页插件保存文献一直报错

> 使用 CNKI 保存时发生错误。改为尝试用 DOI 保存。 使用 DOI 保存时发生错误。改为尝试用 Save as Webpage 保存。

遂找教程并记录，只需要刷新三个设置

1. Zotero内置转换器设置，如图 Zotero设置 > 高级 > 杂项 >自动转换器及样式的更新 >立即更新

![e41a07fcc536dbe986afcb42495566e1](https://s2.loli.net/2025/11/05/mghPwJUjW6Ns7pl.png)

2. 茉莉花插件内置的非官方中文转化器更新 Zotero设置 > 茉莉花 > 中文转换器设置 > 自动更新转换器 > 立即更新

![bfed7be6253226495a2d3942819be9d7](https://s2.loli.net/2025/11/05/NKT4v7X5ILYjsAo.png)

3. 重置浏览器拓展（网页插件）的转化器
   图中为Chrome浏览器拓展栏 右键Zotero Connector拓展图标 > 选项  打开选项设置页面
   ![1dcc2111c56b5c6ff34d1d00ff7859b0](https://s2.loli.net/2025/11/05/cledzqoKrLb9sHv.png)
   在选项设置页面中 Advanced > Translators > Reset Translators
   ![37abe810090a4b8b70a32cd68b7cd832](https://s2.loli.net/2025/11/05/MXc7GDBOgWpZsyq.png)

就OK了 但是我在第2步之后重启了浏览器和Zotero虽然直到第3步才有效，但是可能重启Zotero也有效

如果完成3步还不行可以尝试重启Zotero和浏览器以及重复第3步
