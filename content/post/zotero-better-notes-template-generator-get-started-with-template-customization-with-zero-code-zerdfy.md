---
title: Zotero Better Notes 模板生成器：让模板定制零代码上手
slug: >-
  zotero-better-notes-template-generator-get-started-with-template-customization-with-zero-code-zerdfy
url: >-
  /post/zotero-better-notes-template-generator-get-started-with-template-customization-with-zero-code-zerdfy.html
date: '2025-11-08 00:29:43+08:00'
lastmod: '2025-11-08 01:23:18+08:00'
tags:
  - zotero
  - 插件
  - 工具
categories:
  - 图文教程
  - 效率工具
keywords: zotero,插件,工具
description: >-
  本文介绍了Zotero Better
  Notes模板生成器的使用方法，该工具通过可视化界面实现笔记模板的零代码定制。用户只需在网页上选择需要的模块，如标题、元数据、标注章节等，并设置颜色和文字内容，即可实时预览模板效果并生成对应的代码。生成的代码可直接复制到Zotero的Better
  Notes插件中保存使用，从而快速创建高质量的笔记模板。该工具基于Better Notes社区的模板改进，简化了模板定制流程，方便非技术用户高效利用。
toc: true
isCJKLanguage: true
---



![image](https://s2.loli.net/2025/11/08/vsVe6BNySRDThMx.png)

# Zotero Better Notes 模板生成器：让模板定制零代码上手

很多 Zotero 用户想要自定义笔记模板，却被复杂的代码劝退。因此做了**Zotero 笔记模板生成器（Template Generator）**  它通过可视化界面，**无需编写一行代码**，也能快速生成适配 Better Notes 的高质量笔记模板。

工具网页➡️：[Zotero笔记模板生成器](https://stream-l.github.io/template-generator.html)

演示视频▶️：[Zotero 笔记模板生成器:让模板定制零代码上手_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1fAkXBJEA7)

下图①页面为模板生成器，②为模板生成的预览，会有一些“$"代码，导入Zotero后会被替换，③为在Zotero中生成的笔记预览，代码会被文献信息替换，期刊标签会显示在期刊名称后

![image](https://s2.loli.net/2025/11/08/vsVe6BNySRDThMx.png)

插件根据Better Notes讨论区模板改进得到

[windwind/zotero-better-notes 笔记模板 · 讨论 · GitHub](https://github.com/windingwind/zotero-better-notes/discussions/categories/note-templates)

### 🧩 核心亮点

- **零代码定制**  
  通过简单的勾选、颜色选择、文字输入即可完成模板配置，不需要了解任何 编码知识。
- **实时可视化生成**  
  网页会即时展示模板结构，所见即所得，生成代码可直接复制到 Better Notes 插件使用。

### 🙋准备工作

提前安装Zotero + Better Notes 插件

### 🚀 使用流程

1. 打开网页 👉 [Zotero笔记模板生成器](https://stream-l.github.io/template-generator.html)
2. 在界面中选择你想包含的模块（标题、元数据、标注章节等）
3. 点击 ​ **“生成代码”** ，复制结果
4. 将代码粘贴到 Zotero → Better Notes 模板编辑器中保存即可

第4步展开版：提前在Zotero选中一个文献，打开 编辑> 设置 > Better Notes 向下滑 模板 > 模板编辑器

![image](https://s2.loli.net/2025/11/09/rYu8kjlI1M4WNRq.png)

![image](https://s2.loli.net/2025/11/09/JRqjFywkeEoDZ39.png)

点击保存模板后，如果成功右侧预览区就会显示先前在Zotero中选中的文献对应的笔记效果

也可以换一个文献，再点击模板编辑器的保存，还能刷新新的文献的效果。

之后还会在B站号更新相关演示和教程 [斯隹木Stream的个人空间-斯隹木Stream个人主页-哔哩哔哩视频](https://space.bilibili.com/14423730)

‍

### 🥱联动功能

#### Zotcard

如果你安装了 **Zotcard** 插件，可以在生成笔记模板的笔记标题设置设为 `## XX卡` 的格式，这样能被卡片管理器识别到

![image](https://s2.loli.net/2025/11/09/Bfa8igDmOK4v9Ue.png)

效果如图：

![image](https://s2.loli.net/2025/11/09/gGKNqJXL6CiuZzp.png)

#### **Actions & Tags**

如果你安装了**Actions & Tags** 插件 还可以增加批量添加笔记模板的脚本

![image](https://s2.loli.net/2025/11/09/PmOh7CL3zXABslN.png)

设置如图，即可多选条目后批量添加模板笔记

![image](https://s2.loli.net/2025/11/09/v7SEiPKBOyTQGIW.png)

![image](https://s2.loli.net/2025/11/09/foL9OsJgIDYr4dp.png)

自定义脚本：

```javascript
/**
 * @author Stream-L
 * 脚本功能：批量为多个条目基于Better Notes模板创建子笔记
 * 
 * 使用说明：
 * 1. 多选条目（可以选择多个文献条目）
 * 2. 运行此脚本
 * 3. 从Better Notes的（条目）模板列表中选择一个模板
 * 4. 脚本会为每个选中的条目创建一个基于模板的子笔记
 * 5. 生成的笔记将作为各自条目的子笔记保存
 */

if (item) return; // 仅对所有选中项执行一次

const Zotero = require("Zotero");
const window = require("window");
const console = require("console");

// 获取选中的项目
let selectedItems = [];
if (typeof items !== "undefined" && items.length > 0) {
  selectedItems = items;
} else if (typeof item !== "undefined") {
  selectedItems = [item];
} else {
  window.alert("请先选择要处理的条目");
  return;
}

// 过滤出有效的条目（排除笔记和附件）
let validItems = selectedItems.filter(itm => itm.isRegularItem());

if (validItems.length === 0) {
  window.alert("请选择至少一个有效的文献条目（不能是笔记或附件）");
  return;
}

console.log(`[INFO] 选中了 ${validItems.length} 个有效条目`);

// 创建进度窗口
let progressWindow = new Zotero.ProgressWindow({ closeOnClick: false });
progressWindow.changeHeadline(`批量生成笔记 (共${validItems.length}个条目)`);
progressWindow.show();

/**
 * 获取Better Notes的模板列表并让用户选择
 */
async function selectTemplate() {
  try {
    // 尝试使用Better Notes API获取模板
    const BetterNotes = Zotero.BetterNotes;
    if (!BetterNotes) {
      throw new Error("Better Notes插件未安装或未启用");
    }
    
    // 获取所有模板的键名
    const allTemplateKeys = BetterNotes.api.template.getTemplateKeys();
    
    if (!allTemplateKeys || allTemplateKeys.length === 0) {
      throw new Error("未找到任何模板");
    }
    
    // 只保留 [Item] 类型的模板（不区分大小写）
    const itemTemplateKeys = allTemplateKeys.filter(key => 
      key.toLowerCase().startsWith("[item]")
    );
    
    if (itemTemplateKeys.length === 0) {
      throw new Error("未找到任何 [Item] 类型的模板");
    }
    
    console.log(`[INFO] 找到 ${itemTemplateKeys.length} 个 [Item] 类型模板`);
    
    // 构建模板列表显示文本
    const templateList = itemTemplateKeys.map((key, idx) => `${idx + 1}. ${key}`).join('\n');
    
    // 使用 prompt 让用户输入数字选择
    const selection = window.prompt(
      `找到以下 [Item] 类型模板：\n\n${templateList}\n\n请输入模板序号（1-${itemTemplateKeys.length}）：`
    );
    
    if (!selection) {
      return null;
    }
    
    const selectedIndex = parseInt(selection) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= itemTemplateKeys.length) {
      throw new Error("无效的模板序号");
    }
    
    return itemTemplateKeys[selectedIndex];
    
  } catch (error) {
    console.error("选择模板失败:", error);
    throw error;
  }
}

/**
 * 为单个条目创建基于模板的笔记
 */
async function createNoteForItem(parentItem, templateKey, itemIndex, totalItems) {
  const itemTitle = parentItem.getField("title") || "无标题";
  const progressIcon = 'chrome://zotero/skin/spinner-16px.png';
  const itemProgress = new progressWindow.ItemProgress(
    progressIcon, 
    `[${itemIndex}/${totalItems}] ${itemTitle.substring(0, 50)}`
  );
  
  try {
    itemProgress.setProgress(0);
    itemProgress.setText("⏳ 正在创建笔记...");
    
    // 1. 创建一个空笔记作为子笔记
    const noteItem = new Zotero.Item("note");
    noteItem.libraryID = parentItem.libraryID;
    noteItem.parentID = parentItem.id;
    await noteItem.saveTx();
    
    itemProgress.setProgress(30);
    itemProgress.setText("⏳ 正在应用模板...");
    
    // 2. 使用 Better Notes 的模板引擎填充笔记
    const BetterNotes = Zotero.BetterNotes;
    let templateHTML = '';
    
    try {
      // Item 模板 - 会自动填充条目的元数据变量
      templateHTML = await BetterNotes.api.template.runItemTemplate(templateKey, {
        itemIds: [parentItem.id],
        targetNoteId: noteItem.id,
      });
      
      itemProgress.setProgress(70);
      itemProgress.setText("⏳ 正在写入内容...");
      
      // 将模板结果插入笔记
      await BetterNotes.api.note.insert(noteItem, templateHTML, -1);
      
      // 保存笔记
      await noteItem.saveTx();
      
      itemProgress.setProgress(100);
      itemProgress.setText("✅ 笔记创建成功");
      
      return { success: true, noteId: noteItem.id };
      
    } catch (error) {
      console.error(`应用模板失败 (条目: ${itemTitle}):`, error);
      
      // 如果笔记已创建但模板应用失败，删除笔记
      if (noteItem.id) {
        try {
          await noteItem.eraseTx();
        } catch (e) {
          console.error("删除失败的笔记时出错:", e);
        }
      }
      
      throw new Error(`应用模板失败: ${error.message}`);
    }
    
  } catch (error) {
    console.error(`为条目创建笔记失败 (${itemTitle}):`, error);
    itemProgress.setError();
    itemProgress.setText(`❌ 失败: ${error.message.substring(0, 50)}`);
    
    return { success: false, error: error.message };
  }
}

/**
 * 主流程
 */
async function main() {
  let selectedTemplateKey = null;
  
  try {
    // 1. 让用户选择模板
    console.log("[INFO] 正在加载模板列表...");
    
    selectedTemplateKey = await selectTemplate();
    
    if (!selectedTemplateKey) {
      console.log("[INFO] 用户取消选择模板");
      progressWindow.close();
      return;
    }
    
    console.log(`[INFO] 用户选择模板: ${selectedTemplateKey}`);
    
    // 2. 批量为每个条目创建笔记
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (let i = 0; i < validItems.length; i++) {
      const currentItem = validItems[i];
      const result = await createNoteForItem(
        currentItem, 
        selectedTemplateKey, 
        i + 1, 
        validItems.length
      );
      
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({
          title: currentItem.getField("title") || "无标题",
          error: result.error
        });
      }
      
      // 短暂延迟，避免过快
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 3. 显示汇总结果
    console.log("=".repeat(60));
    console.log("[完成] 批量生成笔记任务完成");
    console.log(`成功: ${results.success} 个`);
    console.log(`失败: ${results.failed} 个`);
    
    if (results.errors.length > 0) {
      console.log("\n失败的条目:");
      results.errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.title}`);
        console.log(`   错误: ${err.error}`);
      });
    }
    console.log("=".repeat(60));
    
    // 显示最终汇总
    const summaryIcon = results.failed === 0 ? 
      'chrome://zotero/skin/tick.png' : 
      'chrome://zotero/skin/cross.png';
    
    const summaryProgress = new progressWindow.ItemProgress(
      summaryIcon,
      `完成：成功 ${results.success} 个，失败 ${results.failed} 个`
    );
    summaryProgress.setProgress(100);
    
    progressWindow.startCloseTimer(5000);
    
  } catch (error) {
    console.error("[错误] 批量生成笔记失败:", error);
    
    const errorProgress = new progressWindow.ItemProgress(
      'chrome://zotero/skin/cross.png',
      "批量生成失败"
    );
    errorProgress.setError();
    errorProgress.setText(`❌ ${error.message}`);
    
    progressWindow.startCloseTimer(5000);
  }
}

// 执行主流程
main();

```
