---
title: Zotero Better Notes 的 Pandoc 导出脚本
slug: pandoc-export-script-for-zotero-better-notes-znktcu
url: /post/pandoc-export-script-for-zotero-better-notes-znktcu.html
date: '2025-12-02 00:09:44+08:00'
lastmod: '2025-12-02 01:23:07+08:00'
tags:
  - zotero
  - pandoc
  - 思源笔记
  - 脚本
categories:
  - 效率工具
  - 图文教程
keywords: zotero,pandoc,思源笔记,脚本
description: >-
  本文介绍了如何利用Pandoc将Zotero Better
  Notes中的笔记导出为格式美观的Word文档。通过自定义Markdown转换和Word模板，用户可以统一字体、标题和段落样式，避免原生导出功能带来的排版问题。同时，脚本支持图片自动嵌入和Zotero链接的转换，提高导出效率和文档质量。文章详细说明了Pandoc的安装方法、模板配置路径以及如何在Zotero中设置自定义导出脚本，使用户能够方便地进行单条或批量导出操作，减少手动调整格式的繁琐工作。
toc: true
isCJKLanguage: true
---



# Zotero Better Notes 的 Pandoc 导出脚本

## 脚本痛点与优势

​**痛点**：

- Better Notes 自带的 Word 导出功能排版不美观
- 样式不规范，导出后通常需要手动调整字体、段落、标题格式

​**解决方案**：

- 使用 Pandoc 将笔记转换为 Markdown，再导出为 Word
- 可自定义 Word 模板，统一字体、标题、段落样式
- 支持图片自动嵌入和 Zotero 链接转换
- 单个或批量导出均可，减少二次手动排版工作

Better Notes 原生导出：

![image](https://s2.loli.net/2025/12/02/XhG9z5fo6dgeFiB.png)

Pandoc导出效果（主要是字体段落啥的还可以进一步自定义）

![image](https://s2.loli.net/2025/12/02/TcXFeUCzjbwQf4O.png)

## 1. 安装 Pandoc

### 使用包管理器（Windows）

- ​**Winget**:

```powershell
winget install Pandoc.Pandoc
```

- 或者**Chocolatey**:

```powershell
choco install pandoc
```

### 检查 Pandoc 路径

1. 打开 **命令提示符 (CMD)**  或 **PowerShell**
2. 输入：

    ```powershell
    where pandoc
    ```
3. 输出的路径就是 Pandoc 可执行文件路径，如下图：

    ![image](https://s2.loli.net/2025/12/02/AL8UqcCPOe6shbi.png)
4. 配置到脚本顶部 `USER_CONFIG.pandocPaths`​ 中（如果是通过命令行直接安装应该是可以识别到的，自己下载安装的话可能需要配置，注意输入到代码中的路径需要是双反斜杠，且要有双引号，类似于 `"C:\Program Files\Pandoc\pandoc.exe"`​,  `"C:\Program Files (x86)\Pandoc\pandoc.exe"`

### 模板文件路径

- Word 模板路径示例（存在哪都行）：

```
C:\Users\<你的用户名>\Documents\template\pandoc\my_template.docx
```

- 在脚本中配置：

```javascript
templatePath: "C:\\Users\\<你的用户名>\\Documents\\template\\pandoc\\my_template.docx",
```

![image](https://s2.loli.net/2025/12/02/nC4S53rbMRqiyeY.png)

可以使用右键复制文件地址 但是注意复制出的地址类似于以下格式，需要将 “\\" 在代码中改为 “\\\\"。

```vb
"C:\Users\STREAM\Documents\template\pandoc\templates_标题不编号 -列表第二行顶格_可设置代码块高亮样式.docx"
```

## 2. 配置 Actions & Tags 使用脚本

1. 打开 Zotero
2. 安装 **Better Notes** 插件 和 **Actions & Tags** 插件
3. 点击  **＋ 新建**
4. 输入自定义脚本名称，如 `Pandoc`​ ，事件 `无`​  操作 `自定义脚本`
5. 将完整 Pandoc 脚本粘贴到**数据**编辑框
6. 菜单项自定义 如 `Pandoc`​，勾选**条目菜单中**  保存

    ![image](https://s2.loli.net/2025/12/02/qF9SvaPm2cgwKtU.png)
7. 回到 Zotero，选中笔记条目 → 右键  **→ 触发动作**（Actions & Tags）  **→**  你的脚本定义的菜单项 这里是`pandoc`

    ![image](https://s2.loli.net/2025/12/02/Df8PKMO59zUJBsv.png)
8. 根据提示选择导出路径或输出文件夹，执行导出 （需要稍等片刻）

    ![image](https://s2.loli.net/2025/12/02/4kGDEZ1YQKaUIws.png)

    会弹出提示 OK即可跳到文件所在目录

## 3. 使用选项

- ​`linkStyle`​: `"hyperlink"`​（生成可点击链接）或 `"text"`（仅保留文本）
- ​`processImages`​: `true`​（处理图片）或 `false`（忽略图片）
- ​`debug`​: `true` 打印调试信息（输出在zotero后端）

## 4. 代码内容（可快速复制）

```javascript
/**
 * Pandoc Export Script for Zotero Better Notes
 * 
 * 功能：将 Zotero 笔记导出为 Word (docx) 文档，支持图片和引用链接
 * 
 * 作者：Stream-L
 * 日期：2025-12-01
 * 版本：2.0
  */

// ============================================================================
//  用户配置区域 (USER CONFIGURATION)
//  ============================================================================
const USER_CONFIG = {
    // Pandoc 可执行文件搜索路径列表
    // 脚本会依次检查这些路径，直到找到可用的 Pandoc
    pandocPaths: [
        "C:\\Program Files\\Pandoc\\pandoc.exe",
        "C:\\Program Files (x86)\\Pandoc\\pandoc.exe",
        "pandoc", // 尝试系统 PATH
    ],

    // Word 模板路径 (.docx) ！！！【需要修改到自己的模板路径】
    // 模板中的样式（字体、段落格式等）将被应用到输出文档
    templatePath: "C:\\Users\\STREAM\\Documents\\template\\pandoc\\不编号templates_报告自用.docx",

    // 导出选项
    options: {
        // 链接样式: "hyperlink" 或 "text"
        // "hyperlink" - 生成可点击的超链接
        // "text" - 仅保留文本，去除链接
        linkStyle: "hyperlink",
        
        // 是否处理图片（解析 Better Notes 的复杂图片格式）
        processImages: true,
        
        // 调试模式
        debug: true
    }
};

// ============================================================================
// 脚本主体 - 请勿修改以下代码
// ============================================================================

// 阻止脚本多次执行
if (typeof item !== "undefined" && item) return;

const Zotero = require("Zotero");
const window = require("window");
const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

// 获取选中的条目
let selectedItems = [];
if (typeof items !== "undefined" && items.length > 0) {
    selectedItems = items;
} else if (typeof item !== "undefined") {
    selectedItems = [item];
} else {
    window.alert("请先选择要处理的条目");
    return;
}

const CONFIG = {
    templatePath: USER_CONFIG.templatePath,
    pandocPath: null,
    ...USER_CONFIG.options
};

// ============================================================================
// 核心函数
// ============================================================================

/**
 * 查找 Pandoc 可执行文件
 */
async function findPandoc() {
    const localAppData = Services.env.get("LOCALAPPDATA");
    const searchPaths = [
        ...USER_CONFIG.pandocPaths,
        `${localAppData}\\Pandoc\\pandoc.exe`
    ];

    for (const path of searchPaths) {
        if (!path) continue;
        
        if (path === "pandoc") continue; // 跳过，最后尝试
        
        if (await IOUtils.exists(path)) {
            Zotero.debug(`[Pandoc Export] 找到 Pandoc: ${path}`);
            return path;
        }
    }

    if (USER_CONFIG.pandocPaths.includes("pandoc")) {
        return "pandoc";
    }

    throw new Error(
        "无法找到 Pandoc 可执行文件。\n\n" +
        "请使用以下方法之一安装：\n" +
        "1. Winget: winget install Pandoc.Pandoc\n" +
        "2. Chocolatey: choco install pandoc\n" +
        "3. 官网下载: https://pandoc.org/installing.html\n\n" +
        "安装后请重新运行此脚本。"
    );
}

/**
 * 选择保存文件路径
 */
function pickSaveFile(defaultName) {
    return new Promise((resolve) => {
        const nsIFilePicker = Components.interfaces.nsIFilePicker;
        const fp = Components.classes["@mozilla.org/filepicker;1"]
            .createInstance(nsIFilePicker);
        
        fp.init(window, "保存 Word 文档", nsIFilePicker.modeSave);
        fp.appendFilter("Word 文档 (*.docx)", "*.docx");
        fp.defaultString = defaultName;
        fp.defaultExtension = "docx";
        
        fp.open((result) => {
            if (result === nsIFilePicker.returnOK || result === nsIFilePicker.returnReplace) {
                let path = fp.file.path;
                if (!path.toLowerCase().endsWith(".docx")) {
                    path += ".docx";
                }
                resolve(path);
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * 选择输出目录
 */
function pickDirectory() {
    return new Promise((resolve) => {
        const nsIFilePicker = Components.interfaces.nsIFilePicker;
        const fp = Components.classes["@mozilla.org/filepicker;1"]
            .createInstance(nsIFilePicker);
        
        fp.init(window, "选择输出目录", nsIFilePicker.modeGetFolder);
        
        fp.open((result) => {
            if (result === nsIFilePicker.returnOK) {
                resolve(fp.file.path);
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * 获取笔记标题
 */
function getNoteTitle(noteItem) {
    const note = noteItem.getNote();
    const parser = new DOMParser();
    const doc = parser.parseFromString(note, "text/html");
    
    const h1 = doc.querySelector("h1, h2, h3");
    if (h1 && h1.textContent.trim()) {
        return sanitizeFilename(h1.textContent.trim());
    }
    
    const text = doc.body.textContent.trim();
    if (text) {
        return sanitizeFilename(text.substring(0, 50));
    }
    
    return "untitled_note";
}

/**
 * 清理文件名
 */
function sanitizeFilename(name) {
    return name
        .replace(/[<>:"/\\|?*]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 100);
}

/**
 * 笔记转 Markdown
 */
async function noteToMarkdown(noteItem) {
    const api = Zotero.BetterNotes?.api;
    if (api && api.convert && api.convert.note2md) {
        let markdown = await api.convert.note2md(noteItem, Zotero.getTempDirectory().path, {
            keepNoteLink: true,
            withYAMLHeader: false,
        });
        
        markdown = await processMarkdownContent(markdown);
        return markdown;
    }
    
    return await processNoteHtml(noteItem);
}

/**
 * 处理 Markdown 内容（图片和链接）
 */
async function processMarkdownContent(markdown) {
    // 1. 递归移除 span 标签
    let prev = "";
    while (markdown !== prev) {
        prev = markdown;
        markdown = markdown.replace(/<span\s+[^>]*>([\s\S]*?)<\/span>/gi, "$1");
    }

    // 2. 处理链接
    markdown = markdown.replace(/<a\s+(?:[^>]*?\s+)?href=["'"](zotero:\/\/[^"'"]+)["'"][^>]*>([\s\S]*?)<\/a>/gi, (match, url, text) => {
        if (CONFIG.linkStyle === "text") {
            return text;
        }
        return `[${text}](${url})`;
    });

    // 3. 处理图片
    const replacements = [];
    const storagePath = Zotero.getStorageDirectory().path;

    // Markdown 图片语法
    const mdImgRegex = /!$(.*?)$$(attachments\/([^)]+))$/g;
    let match;
    while ((match = mdImgRegex.exec(markdown)) !== null) {
        const fullMatch = match[0];
        const altText = match[1];
        const filename = match[3];
        
        let key = null;
        const keyMatch = altText.match(/data-attachment-key=["'"]([^"'"]+)["'"]/);
        if (keyMatch) {
            key = keyMatch[1];
        } else {
            key = filename.split('.')[0];
        }

        if (key) {
            replacements.push({ fullMatch, key, alt: "image" });
        }
    }

    // HTML img 标签
    const htmlImgRegex = /<img\s+[^>]*data-attachment-key=["'"]([^"'"]+)["'"][^>]*>/gi;
    while ((match = htmlImgRegex.exec(markdown)) !== null) {
        replacements.push({
            fullMatch: match[0],
            key: match[1],
            alt: "image"
        });
    }

    // 执行图片路径替换
    for (const rep of replacements) {
        let realPath = null;
        const itemDir = PathUtils.join(storagePath, rep.key);
        
        if (await IOUtils.exists(itemDir)) {
            const children = await IOUtils.getChildren(itemDir);
            for (const child of children) {
                if (child.toLowerCase().match(/\.(png|jpg|jpeg|gif|bmp|webp|svg)$/)) {
                    realPath = child;
                    break;
                }
            }
        }

        if (realPath) {
            realPath = realPath.replace(/\\/g, '/');
            const newImage = `![${rep.alt}](${realPath})`;
            markdown = markdown.replace(rep.fullMatch, newImage);
            Zotero.debug(`[Pandoc] 图片替换: ${rep.key} -> ${realPath}`);
        } else {
            Zotero.debug(`[Pandoc] 未找到图片: ${rep.key}`);
        }
    }

    return markdown;
}

/**
 * 处理笔记 HTML（回退方案）
 */
async function processNoteHtml(noteItem) {
    const note = noteItem.getNote();
    const parser = new DOMParser();
    const doc = parser.parseFromString(note, "text/html");
    
    const images = doc.querySelectorAll('img[data-attachment-key]');
    for (const img of images) {
        const key = img.getAttribute('data-attachment-key');
        if (key) {
            const storagePath = Zotero.getStorageDirectory().path;
            const exts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
            
            for (const ext of exts) {
                const imagePath = PathUtils.join(storagePath, key, key + ext);
                if (await IOUtils.exists(imagePath)) {
                    img.setAttribute('src', imagePath);
                    break;
                }
            }
        }
    }
    
    return simpleHtmlToMarkdown(doc.body);
}

/**
 * 简单的 HTML 转 Markdown
 */
function simpleHtmlToMarkdown(element) {
    let result = "";
    
    function process(node, depth = 0) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
        }
        
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return "";
        }
        
        const tag = node.tagName.toLowerCase();
        let content = "";
        
        for (const child of node.childNodes) {
            content += process(child, depth + (tag === 'ul' || tag === 'ol' ? 1 : 0));
        }
        
        switch (tag) {
            case "h1": return `# ${content.trim()}\n\n`;
            case "h2": return `## ${content.trim()}\n\n`;
            case "h3": return `### ${content.trim()}\n\n`;
            case "p": return `${content.trim()}\n\n`;
            case "strong":
            case "b": return `**${content}**`;
            case "em":
            case "i": return `*${content}*`;
            case "code": return `\`${content}\``;
            case "a":
                const href = node.getAttribute("href") || "";
                const text = content.trim() || href;
                if (CONFIG.linkStyle === "text") return text;
                return `[${text}](${href})`;
            case "li":
                const indent = "  ".repeat(Math.max(0, depth - 1));
                return `${indent}- ${content.trim()}\n`;
            case "br": return "\n";
            default: return content;
        }
    }
    
    result = process(element);
    return result.replace(/\n{3,}/g, "\n\n");
}

/**
 * 运行 Pandoc
 */
async function runPandoc(inputPath, outputPath) {
    const tempDir = Zotero.getTempDirectory().path;
    const errorLogPath = PathUtils.join(tempDir, `pandoc_error_${Zotero.Utilities.randomString(6)}.log`);
    const batPath = PathUtils.join(tempDir, `pandoc_run_${Zotero.Utilities.randomString(6)}.bat`);
    
    // 构建命令
    let cmd = `"${CONFIG.pandocPath}" "${inputPath}" -o "${outputPath}" --wrap=none`;
    
    if (CONFIG.templatePath && await IOUtils.exists(CONFIG.templatePath)) {
        cmd += ` --reference-doc "${CONFIG.templatePath}"`;
    }
    
    cmd += ` 2>"${errorLogPath}"`;

    // 创建批处理文件
    const batContent = "@echo off\r\n" +
        "chcp 65001 > nul\r\n" +
        cmd + "\r\n" +
        "exit /b %errorlevel%\r\n";
    
    const encoder = new TextEncoder();
    await IOUtils.write(batPath, encoder.encode(batContent));
    
    Zotero.debug(`[Pandoc] 批处理: ${batPath}`);
    Zotero.debug(`[Pandoc] 命令: ${cmd}`);
    
    return new Promise(async (resolve, reject) => {
        try {
            const cmdFile = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsIFile);
            cmdFile.initWithPath("C:\\Windows\\System32\\cmd.exe");
            
            const process = Components.classes["@mozilla.org/process/util;1"]
                .createInstance(Components.interfaces.nsIProcess);
            
            process.init(cmdFile);
            process.run(true, ["/c", batPath], 2);
            
            const exitValue = process.exitValue;
            Zotero.debug(`[Pandoc] 退出码: ${exitValue}`);
            
            // 读取错误日志
            let errorLog = "";
            try {
                if (await IOUtils.exists(errorLogPath)) {
                    const errorBytes = await IOUtils.read(errorLogPath);
                    const decoder = new TextDecoder("utf-8");
                    errorLog = decoder.decode(errorBytes);
                }
            } catch (e) {}
            
            // 清理临时文件
            try {
                await IOUtils.remove(batPath, { ignoreAbsent: true });
                await IOUtils.remove(errorLogPath, { ignoreAbsent: true });
            } catch (e) {}
            
            if (exitValue === 0) {
                const outputExists = await IOUtils.exists(outputPath);
                if (outputExists) {
                    resolve();
                } else {
                    reject(new Error(`Pandoc 执行完成但输出文件未生成\n${errorLog || ''}`));
                }
            } else if (exitValue === 9009) {
                reject(new Error(
                    "无法找到 Pandoc 可执行文件。\n\n" +
                    "安装方法：\n" +
                    "1. Winget: winget install Pandoc.Pandoc\n" +
                    "2. Chocolatey: choco install pandoc\n" +
                    "3. 官网: https://pandoc.org/installing.html\n\n" +
                    "安装后在脚本顶部配置路径。"
                ));
            } else {
                reject(new Error(`Pandoc 失败 (退出码: ${exitValue})\n\n${errorLog}`));
            }
        } catch (error) {
            try {
                await IOUtils.remove(batPath, { ignoreAbsent: true });
                await IOUtils.remove(errorLogPath, { ignoreAbsent: true });
            } catch (e) {}
            reject(error);
        }
    });
}

/**
 * 导出单个笔记（内部函数，不弹窗）
 */
async function exportNoteInternal(noteItem, outputPath) {
    const tempDir = Zotero.getTempDirectory().path;
    
    // 转换为 Markdown
    const markdown = await noteToMarkdown(noteItem);
    
    // 保存临时文件
    const mdPath = PathUtils.join(tempDir, `${Zotero.Utilities.randomString(8)}.md`);
    await Zotero.File.putContentsAsync(mdPath, markdown);
    
    // 调用 Pandoc
    await runPandoc(mdPath, outputPath);
    
    // 清理
    await IOUtils.remove(mdPath, { ignoreAbsent: true });
}

/**
 * 显示成功提示
 */
function showSuccess(path) {
    const result = window.confirm(
        `笔记已成功导出到:\n${path}\n\n点击"确定"打开文件夹`
    );
    
    if (result) {
        Zotero.File.reveal(path);
    }
}

// ============================================================================
// 主入口
// ============================================================================

async function main() {
    // 1. 查找 Pandoc
    try {
        CONFIG.pandocPath = await findPandoc();
    } catch (e) {
        window.alert(e.message);
        return;
    }

    // 2. 收集笔记
    const noteItems = [];
    for (const selectedItem of selectedItems) {
        if (selectedItem.itemType === "note") {
            noteItems.push(selectedItem);
        } else if (selectedItem.isRegularItem && selectedItem.isRegularItem()) {
            const notes = selectedItem.getNotes();
            for (const noteId of notes) {
                noteItems.push(Zotero.Items.get(noteId));
            }
        }
    }
    
    if (noteItems.length === 0) {
        window.alert("请先选择一个或多个笔记条目");
        return;
    }
    
    // 3. 导出
    if (noteItems.length === 1) {
        // 单个笔记
        const noteItem = noteItems[0];
        const title = getNoteTitle(noteItem);
        const outputPath = await pickSaveFile(`${title}.docx`);
        
        if (!outputPath) return;
        
        try {
            await exportNoteInternal(noteItem, outputPath);
            showSuccess(outputPath);
        } catch (error) {
            Zotero.logError(error);
            window.alert(`导出失败: ${error.message}`);
        }
    } else {
        // 批量导出
        const outputDir = await pickDirectory();
        if (!outputDir) return;
        
        const results = [];
        for (const noteItem of noteItems) {
            try {
                const title = getNoteTitle(noteItem);
                const outputPath = PathUtils.join(outputDir, `${title}.docx`);
                await exportNoteInternal(noteItem, outputPath);
                results.push({ success: true, path: outputPath });
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        
        if (successCount > 0) {
            const firstSuccess = results.find(r => r.success);
            const openFolder = window.confirm(
                `批量导出完成\n成功: ${successCount} 个\n失败: ${failCount} 个\n\n点击"确定"打开文件夹`
            );
            if (openFolder && firstSuccess) {
                Zotero.File.reveal(firstSuccess.path);
            }
        } else {
            window.alert(`导出失败，所有 ${failCount} 个笔记均失败`);
        }
    }
}

// 运行
main().catch(error => {
    Zotero.logError(error);
    window.alert(`导出失败: ${error.message}`);
});

```
