---
title: Zotero Actions and Tags 常用脚本备份
slug: zotero-actions-and-tags-common-script-backup-zi9mg1
url: /post/zotero-actions-and-tags-common-script-backup-zi9mg1.html
date: '2026-11-13 17:51:12+08:00'
lastmod: '2026-11-13 18:31:00+08:00'
tags:
  - zotero
  - 插件
  - 备份
  - 科研
keywords: zotero,插件,备份,科研
toc: true
isCJKLanguage: true
---



![image](/images/cover_033-20261113185103-19ioz2z.webp)

# Zotero Actions and Tags 常用脚本备份

# 说明

需安装 Actions and Tags 插件

官方链接：[GitHub - windingwind/zotero-actions-tags: Customize your Zotero workflow. · GitHub](https://github.com/windingwind/zotero-actions-tags#readme)

中文社区下载链接：[https://zotero-chinese.com/plugins/#plugin=windingwind%2Fzotero-actions-tags](https://zotero-chinese.com/plugins/#plugin=windingwind%2Fzotero-actions-tags)

‍

使用时主要是​`事件`​​、​`操作`​​、​`数据`​​需要设置为完全一致的，​`名称`​​、​`快捷键`​​、​`菜单项`​都可以根据自己的需求和习惯设定

‍

‍

# 脚本

## 自动翻译标题与摘要

`名称`​：自动翻译标题与摘要

`事件`​​：​`新建条目`

`操作`​​：​`自定义脚本`

`数据`​：

```javascript
/**
 * Zotero Actions and Tags 动作脚本：自动翻译标题与摘要
 * 依赖 PDFTranslate 插件，在新建条目时触发翻译
 * 逻辑：非中文文献自动翻译标题写入 titleTranslation；摘要为空时注册观察者等待摘要加载，加载后自动翻译写入 abstractTranslation
 * 超时60秒自动停止监听，避免残留观察者
 * @author windingwind, PhoenixHwang, northword
 * @link https://github.com/windingwind/zotero-tag/discussions/107
 * @usage Event=Create Item
 */


const Zotero = require("Zotero");

// 检查插件是否可用
if (!Zotero.PDFTranslate) {
    return "[Action:Translate Title & Abstract] Translate for Zotero is not installed or disabled.";
}

// 验证 item 对象
if (!item || !item.getField || typeof item.getField !== 'function') {
    return "[Action:Translate Title & Abstract] Target item is invalid or empty";
}

// 处理标题和摘要翻译
let titleResult = "";
let abstractResult = "";

try {
    const title = item.getField("title");
    const abstract = item.getField("abstractNote");
    const language = item.getField("language");

    // 检查语言是否为中文
    if (language && language.toLowerCase().includes("zh")) {
        return "[Action:Translate Title & Abstract] Content is in Chinese, skipping translation.";
    }

    // 翻译标题
    if (title) {
        titleResult = (await Zotero.PDFTranslate.api.translate(title)).result;
        await Zotero.PDFTranslate.data.ztoolkit.ExtraField.setExtraField(item, "titleTranslation", titleResult);
    }

    // 如果摘要已填充,直接翻译
    if (abstract) {
        abstractResult = (await Zotero.PDFTranslate.api.translate(abstract)).result;
        await Zotero.PDFTranslate.data.ztoolkit.ExtraField.setExtraField(item, "abstractTranslation", abstractResult);
        return `[Action:Translate Title & Abstract] Successfully translated title and abstract.`;
    } else {
        // 设置观察者等待摘要更新
        let timeoutId;
        const observerID = Zotero.Notifier.registerObserver({
            notify: async (event, type, ids, extraData) => {
                if (event === 'modify' && type === 'item' && ids.includes(item.id)) {
                    try {
                        const newAbstract = item.getField('abstractNote');
                        if (newAbstract) {
                            clearTimeout(timeoutId);
                            
                            // 检查语言是否为中文
                            const language = item.getField("language");
                            if (language && language.toLowerCase().includes("zh")) {
                                Zotero.Notifier.unregisterObserver(observerID);
                                return;
                            }
                            
                            abstractResult = (await Zotero.PDFTranslate.api.translate(newAbstract)).result;
                            await Zotero.PDFTranslate.data.ztoolkit.ExtraField.setExtraField(
                                item, 
                                "abstractTranslation", 
                                abstractResult
                            );
                            Zotero.Notifier.unregisterObserver(observerID);
                        }
                    } catch (error) {
                        Zotero.Notifier.unregisterObserver(observerID);
                        Zotero.debug(`[PDFTranslate] Translation error: ${error.message}`);
                    }
                }
            }
        }, ['item']);

        // 60秒后自动注销观察者
        timeoutId = setTimeout(() => {
            Zotero.Notifier.unregisterObserver(observerID);
        }, 60000);

        return "[Action:Translate Title & Abstract] Title translated, waiting for abstract to be filled...";
    }
} catch (error) {
    return `[Action:Translate Title & Abstract] Translation failed: ${error.message}`;
}

```

其他设置建议：

`快捷键`​​：​`[无快捷键]`

`菜单项`​​：​`🔠翻译标题和摘要`

条目菜单中 ✅️

‍

‍

## 批量处理标签

`名称`​：批量处理标签

`事件`​​：​`无`

`操作`​​：​`自定义脚本`

`数据`​：

```javascript
// 批量处理标签
/**
 * Zotero 批量标签处理脚本，适配 Actions and Tags 插件
 * 功能：标签添加、删除、替换、拆分、合并、添加前缀/后缀、标签大小写格式化
 * 特性：支持通配符搜索标签、自定义专业缩写大写、括号内文本弹窗确认大写、防重复执行、操作耗时日志记录
 */

const Zotero = require("Zotero");
const window = require("window");

(async function () {
    const startTime = new Date();

    // Prevent duplicate execution
    if (window.batchTagRunning) return;
    window.batchTagRunning = true;

    // Store user responses for parentheses capitalization
    const promptedValues = new Map();

    // Custom capitalization dictionary
    const customCapitalization = {
        'nist': 'NIST',
        'nerc': 'NERC',
        // Add more custom capitalizations as needed
    };

    // Convert a string to title case based on specified rules
    function toTitleCase(str, title, currentIndex, totalCount) {
        const lowerCaseWords = ["a", "an", "and", "as", "at", "but", "by", "for", "if", "nor", "of", "on", "or", "so", "the", "to", "up", "yet"];
        const separators = ['-', ':', '–', '/', '"', '“', '”'];

        let words = str.split(' ');

        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            const lowerWord = word.toLowerCase();

            // Handle custom capitalization
            if (customCapitalization[lowerWord]) {
                words[i] = customCapitalization[lowerWord];
                continue;
            }

            // Capitalize the first and last word, words following a special character, and major words
            if (i === 0 || i === words.length - 1 || !lowerCaseWords.includes(lowerWord) || isFollowingSpecialChar(words, i, separators) || word.length >= 4) {
                words[i] = capitalizeHyphenatedAndSlashed(word);
            } else {
                words[i] = lowerWord;
            }
        }

        // Ensure words following quotation marks are capitalized
        for (let i = 0; i < words.length; i++) {
            if (words[i].startsWith('"') && words[i].length > 1) {
                words[i] = '"' + capitalizeFirstLetter(words[i].slice(1));
            }
        }

        // Handle text within parentheses
        return words.join(' ').replace(/$([^)]+)$/g, function (match, p1) {
            const lowerP1 = p1.toLowerCase();
            if (customCapitalization[lowerP1]) {
                return `(${customCapitalization[lowerP1]})`;
            }
            if (promptedValues.has(lowerP1)) {
                return `(${promptedValues.get(lowerP1)})`;
            }
            if (p1 !== p1.toUpperCase()) {
                const userResponse = window.confirm(`是否要将标题"${title}"中的"${p1}"转换为大写？您的选择将应用于"${p1}"的所有后续出现。(提示 ${currentIndex}/${totalCount})`);
                const userResponseValue = userResponse ? p1.toUpperCase() : p1;
                promptedValues.set(lowerP1, userResponseValue);
                return `(${userResponseValue})`;
            }
            return match;
        });
    }

    // Capitalize both parts of a hyphenated or slashed word
    function capitalizeHyphenatedAndSlashed(word) {
        const separators = ['-', '/'];
        return word.split(new RegExp(`(${separators.join('|')})`)).map(part => capitalizeFirstLetter(part)).join('');
    }

    // Capitalize the first letter of a word
    function capitalizeFirstLetter(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    // Check if the word follows a special character (-, :, –, /, ")
    function isFollowingSpecialChar(arr, index, separators) {
        if (index > 0) {
            const prevWord = arr[index - 1];
            return separators.some(separator => prevWord.endsWith(separator));
        }
        return false;
    }

    // Convert a string to sentence case
    function toSentenceCase(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace(/(\.\s*\w)/g, function (c) {
            return c.toUpperCase();
        });
    }

    // Convert a string to upper case
    function toUpperCase(str) {
        return str.toUpperCase();
    }

    // Convert a string to lower case
    function toLowerCase(str) {
        return str.toLowerCase();
    }


    // Escape special characters for use in regular expressions
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Get items to edit based on user selection using the Actions and Tags plugin environment
    async function getItemsToEdit(triggerType, item, items) {
        if (items && items.length > 0) {
            // Return multiple items if selected
            return items;
        } else if (item) {
            // Return single item if selected
            return [item];
        } else {
            window.alert("未选择任何条目。");
            return null;
        }
    }

    // Get all unique tags from items
    function getAllTags(items) {
        const tagSet = new Set();
        for (const item of items) {
            const tags = item.getTags();
            for (const tag of tags) {
                tagSet.add(tag.tag);
            }
        }
        return Array.from(tagSet);
    }

    // Function to search tags based on search term (with optional wildcard '*')
    function searchTags(allTags, searchTerm) {
        let regex;
        if (searchTerm.includes('*')) {
            regex = new RegExp(searchTerm.replace(/\*/g, '.*'), 'i');  // Replace all occurrences of '*' with '.*'
        } else {
            regex = new RegExp(escapeRegExp(searchTerm), 'i');
        }
        return allTags.filter(tag => regex.test(tag));
    }

    // Prompt user to select tags from search results
    function selectTagsFromSearchResults(tags) {
        if (tags.length === 0) {
            window.alert("未找到匹配的标签。");
            return null;
        }

        const choices = tags.map((tag, index) => `${index + 1}. ${tag}`).join("\n");
        const choice = window.prompt(`通过逗号分隔的数字选择标签，或输入新的搜索词：\n\n${choices}`);

        if (choice === null) {
            window.alert("操作已取消。");
            return null;
        }

        const selectedIndices = choice.split(',').map(str => parseInt(str.trim(), 10) - 1);
        const selectedTags = selectedIndices.filter(index => !isNaN(index) && index >= 0 && index < tags.length).map(index => tags[index]);

        if (selectedTags.length === 0) {
            window.alert("未选择有效的标签。");
            return null;
        }

        return selectedTags;
    }

    // Get valid input from the user based on predefined options
    async function getValidInput(promptMessage, validOptions) {
        while (true) {
            const userInput = window.prompt(promptMessage);
            const sanitizedInput = userInput ? userInput.trim() : null;
            if (sanitizedInput === null) {
                window.alert("操作已取消。");
                return null;
            }
            if (validOptions.includes(sanitizedInput)) {
                return sanitizedInput;
            } else {
                window.alert(`无效的选项："${sanitizedInput}"。请输入以下选项之一：${validOptions.join(', ')}`);
            }
        }
    }

    // Perform tag operations (add, remove, replace, split, combine, prefix, suffix)
    async function performTagOperation(operation, tags, items, newTags = [], delimiter = null) {
        const promises = items.map(async item => {
            try {
                if (operation === 'add') {
                    item.addTag(tags[0]);
                } else if (operation === 'remove') {
                    for (const tag of tags) {
                        item.removeTag(tag);
                    }
                } else if (operation === 'removeAll') {
                    item.setTags([]);
                } else if (operation === 'replace') {
                    for (const tag of tags) {
                        item.removeTag(tag);
                    }
                    item.addTag(newTags[0]);
                } else if (operation === 'split') {
                    for (const tag of tags) {
                        const itemTags = item.getTags().map(t => t.tag);
                        if (itemTags.includes(tag)) {
                            item.removeTag(tag);
                            const splitTags = tag.split(delimiter).map(t => t.trim());
                            for (const newTag of splitTags) {
                                item.addTag(newTag);
                            }
                        }
                    }
                } else if (operation === 'combine') {
                    for (const tag of tags) {
                        item.removeTag(tag);
                    }
                    for (const newTag of newTags) {
                        item.addTag(newTag);
                    }
                } else if (operation === 'prefix' || operation === 'suffix') {
                    for (const tag of tags) {
                        item.removeTag(tag);
                    }
                    for (const newTag of newTags) {
                        item.addTag(newTag);
                    }
                }
                await item.saveTx();
            } catch (error) {
                Zotero.logError(`Error during ${operation} tag operation on item ${item.id}: ${error.message}`);
            }
        });

        await Promise.all(promises);
        window.alert(`标签操作"${operation}"已完成，处理了 ${items.length} 个条目。`);
    }

     // Apply case conversion to tags
    async function performTagCaseOperation(caseFunction, items) {
        const allTags = getAllTags(items);
        const tagMap = new Map();

        for (let tag of allTags) {
            const newTag = caseFunction(tag, allTags.indexOf(tag) + 1, allTags.length);
            tagMap.set(tag, newTag);
        }

        const promises = items.map(async item => {
            const tags = item.getTags();
            const newTags = tags.map(t => {
                return { tag: tagMap.get(t.tag) || t.tag };
            });
            item.setTags(newTags);
            await item.saveTx();
        });

        await Promise.all(promises);
        window.alert(`已为 ${items.length} 个条目更新标签。`);
    }

    // Log the elapsed time for a given operation
    function logTime(label, time) {
        try {
            Zotero.logError(`${label}: ${(time / 1000).toFixed(2)} seconds`);
        } catch (error) {
            Zotero.logError(`Failed to log time for ${label}: ${error.message}`);
        }
    }

    // Select a base tag from search results
    async function selectBaseTag(allTags) {
        let baseTagChoices = searchTags(allTags, window.prompt("输入基础标签的搜索词："));
        baseTagChoices = baseTagChoices.map((tag, index) => `${index + 1}. ${tag}`).join("\n");
        const baseTagChoice = window.prompt(`通过数字选择基础标签或输入新的搜索词：\n\n${baseTagChoices}`);

        if (baseTagChoice === null) {
            window.alert("操作已取消。");
            return null;
        }

        const baseTagIndex = parseInt(baseTagChoice.trim(), 10) - 1;
        if (isNaN(baseTagIndex) || baseTagIndex < 0 || baseTagIndex >= baseTagChoices.length) {
            window.alert("无效的选择。");
            return null;
        }

        return baseTagChoices.split("\n")[baseTagIndex].split(". ")[1];
    }

    // Search and select tags from search results
    async function searchAndSelectTags(allTags) {
        const searchTerm = window.prompt("输入要搜索的正则表达式或标签：");
        const matchingTags = searchTags(allTags, searchTerm);
        if (matchingTags.length === 0) {
            window.alert("未找到匹配的标签。");
            return null;
        }

        return matchingTags;
    }

    try {
        // Ensure items and item are provided
        if (!items && !item) {
            window.alert("批量标签操作", "未提供条目或条目数组。");
            window.batchTagRunning = false;
            return;
        }

        // Get items to edit based on user selection
        let itemsToEdit = await getItemsToEdit(triggerType, item, items);
        if (!itemsToEdit) {
            window.batchTagRunning = false;
            return;
        }

        Zotero.logError(`Total items to edit: ${itemsToEdit.length}`);

        // Get the action to perform from the user
        const action = await getValidInput(
            `选择操作：
            1. 添加标签
            2. 删除标签（多个选项）
            3. 替换标签
            4. 拆分标签
            5. 合并标签
            6. 对标签应用大小写转换
            7. 为标签添加前缀或后缀`,
            ['1', '2', '3', '4', '5', '6', '7']
        );

        let searchTerm, matchingTags, selectedTags, newTag, delimiter;

        switch (action) {
            case '1':
                const tagToAdd = window.prompt("输入要添加的标签：");
                if (tagToAdd) await performTagOperation('add', [tagToAdd], itemsToEdit);
                else window.alert("未输入标签。");
                break;
            case '2':
                const removeAction = await getValidInput(
                    `选择删除选项：
                    1. 删除单个标签
                    2. 通过搜索删除多个标签
                    3. 删除所有标签
                    4. 删除除指定标签外的所有标签`,
                    ['1', '2', '3', '4']
                );
                switch (removeAction) {
                    case '1':
                        searchTerm = window.prompt("输入要搜索的标签：");
                        matchingTags = searchTags(getAllTags(itemsToEdit), searchTerm);
                        selectedTags = selectTagsFromSearchResults(matchingTags);
                        if (selectedTags) await performTagOperation('remove', selectedTags, itemsToEdit);
                        break;
                    case '2':
                        searchTerm = window.prompt("输入标签搜索词（例如 'temp*' 匹配 'temp'、'temporary' 等）：");
                        matchingTags = searchTags(getAllTags(itemsToEdit), searchTerm);
                        selectedTags = selectTagsFromSearchResults(matchingTags);
                        if (selectedTags) await performTagOperation('remove', selectedTags, itemsToEdit);
                        break;
                    case '3':
                        await performTagOperation('removeAll', [], itemsToEdit);
                        break;
                    case '4':
                        searchTerm = window.prompt("输入要保留的标签搜索词（例如 'temp*' 匹配 'temp'、'temporary' 等）：");
                        matchingTags = searchTags(getAllTags(itemsToEdit), searchTerm);
                        selectedTags = selectTagsFromSearchResults(matchingTags);
                        if (selectedTags) {
                            const tagsToKeep = new Set(selectedTags);
                            await performTagOperation('remove', getAllTags(itemsToEdit).filter(tag => !tagsToKeep.has(tag)), itemsToEdit);
                        }
                        break;
                }
                break;
            case '3':
                searchTerm = window.prompt("输入要搜索的标签（用逗号分隔）：");
                matchingTags = searchTags(getAllTags(itemsToEdit), searchTerm);
                selectedTags = selectTagsFromSearchResults(matchingTags);
                if (selectedTags) {
                    newTag = window.prompt("输入新标签：");
                    if (newTag) await performTagOperation('replace', selectedTags, itemsToEdit, [newTag]);
                    else window.alert("未输入新标签。");
                }
                break;
            case '4':
                const splitAction = await getValidInput(
                    `选择拆分选项：
                    1. 拆分单个标签
                    2. 按指定分隔符拆分所有标签`,
                    ['1', '2']
                );
                if (splitAction === '1') {
                    searchTerm = window.prompt("输入要搜索的标签：");
                    matchingTags = searchTags(getAllTags(itemsToEdit), searchTerm);
                    selectedTags = selectTagsFromSearchResults(matchingTags);
                    if (selectedTags) {
                        delimiter = window.prompt("输入拆分标签的分隔符：");
                        if (delimiter) await performTagOperation('split', selectedTags, itemsToEdit, null, delimiter);
                        else window.alert("未输入分隔符。");
                    }
                } else if (splitAction === '2') {
                    delimiter = window.prompt("输入拆分所有标签的分隔符：");
                    if (delimiter) await performTagOperation('split', getAllTags(itemsToEdit), itemsToEdit, null, delimiter);
                    else window.alert("未输入分隔符。");
                }
                break;
            case '5':
                const allTags = getAllTags(itemsToEdit);
                const baseTag = await selectBaseTag(allTags);
                if (baseTag) {
                    delimiter = window.prompt("输入连接标签的分隔符（可选）：");
                    const tagToCombineRegex = window.prompt("输入要合并的正则表达式或标签：");
                    if (tagToCombineRegex !== null) {
                        const tagsToCombine = searchTags(allTags, tagToCombineRegex);
                        if (tagsToCombine.length > 0) {
                            const newTags = tagsToCombine.map(tag => `${baseTag}${delimiter || ''}${tag}`);
                            await performTagOperation('combine', tagsToCombine.concat(baseTag), itemsToEdit, newTags);
                        } else {
                            window.alert(`未找到匹配模式"${tagToCombineRegex}"的标签。`);
                        }
                    } else {
                        window.alert("正则表达式输入无效。");
                    }
                }
                break;
            case '6':
                const caseOption = await getValidInput(
                    "输入 '1' 选择标题大小写，'2' 选择句子大小写，'3' 选择全大写，'4' 选择全小写：",
                    ['1', '2', '3', '4']
                );

                let caseFunction;
                switch (caseOption) {
                    case '1':
                        caseFunction = (str, currentIndex, totalCount) => toTitleCase(str, str, currentIndex, totalCount);
                        break;
                    case '2':
                        caseFunction = toSentenceCase;
                        break;
                    case '3':
                        caseFunction = toUpperCase;
                        break;
                    case '4':
                        caseFunction = toLowerCase;
                        break;
                }

                await performTagCaseOperation(caseFunction, itemsToEdit);
                break;
            case '7':
                const prefixOrSuffix = await getValidInput(
                    "输入 '1' 添加前缀，或 '2' 添加后缀：",
                    ['1', '2']
                );

                newTag = window.prompt(`输入要添加的${prefixOrSuffix === '1' ? '前缀' : '后缀'}：`);
                if (!newTag) {
                    window.alert("未输入前缀或后缀。");
                    break;
                }

                matchingTags = await searchAndSelectTags(getAllTags(itemsToEdit));

                if (matchingTags) {
                    const newTags = matchingTags.map(tag =>
                        prefixOrSuffix === '1' ? `${newTag}${tag}` : `${tag}${newTag}`
                    );
                    await performTagOperation(prefixOrSuffix === '1' ? 'prefix' : 'suffix', matchingTags, itemsToEdit, newTags);
                } else {
                    window.alert("未找到匹配模式的标签。");
                }
                break;
            default:
                window.alert("无效的操作。");
                break;
        }
    } catch (error) {
        Zotero.logError(`批量标签脚本错误: ${error.message}`);
        window.alert(`发生错误: ${error.message}`);
    } finally {
        window.batchTagRunning = false;
        const endTime = new Date();
        logTime("Total time", endTime - startTime);
    }
})();
```

其他设置建议：

`快捷键`​​：​`[无快捷键]`

`菜单项`​​：​`🏷️批量处理标签`

条目菜单中 ✅️

分类菜单中 ✅️

‍

## 复制链接

`名称`​：复制链接

`事件`​​：​`无`

`操作`​​：​`自定义脚本`

`数据`​：

```javascript
// 该脚本用于为Zotero中选中的项目生成可复制的链接，并根据配置生成不同格式的链接文本
// 功能概述：
// 1. 支持为选中的文献、附件、注释或集合生成链接
// 2. 可配置链接文本来源、链接格式和链接行为
// 3. 能根据项目类型自动调整链接目标（如PDF附件直接链接到打开PDF）
// 4. 生成的链接可复制到剪贴板，支持HTML、Markdown和纯文本格式

// @author windingwind, garth74
// @link https://github.com/windingwind/zotero-actions-tags/discussions/115
// @usage 选中库中的项目并按下分配的快捷键
// @update Mon, 22 Jan 2024 00:10:18 GMT (by new Date().toGMTString())

// 可编辑设置区域
/** @type {string} 用于作为链接文本的字段名，使用引用键时设置为"citationKey" */
let linkTextField = "title";

/** @type {'html' | 'md' | 'plain'} 生成的链接类型 */
let linkType = "html";

/** @type {boolean} 若为true，生成的链接将指向当前选中的集合 */
let useColl = false;

/** @type {boolean} 若为true，当选中项目是笔记时使用Better Notes的zotero://note链接 */
let useNoteLink = false;

/** @type {'select' | 'open-pdf' | 'auto'} 链接行为：select-选中项目，open-pdf-打开PDF，auto-自动判断 */
let linkAction = "auto"; // auto模式：对PDF和注释使用open-pdf，其他使用select

// 脚本核心逻辑
// 为提高效率，对所有选中项目只执行一次
if (item) return;
item = items[0];
if (!item && !collection) return "[Copy Zotero Link] 未选中项目";

// 处理集合链接：强制使用select行为并启用集合模式
if (collection) {
  linkAction = "select";
  useColl = true;
}

// 自动判断链接行为
if (linkAction === "auto") {
  if (item.isPDFAttachment() || item.isAnnotation()) {
    linkAction = "open-pdf";
  } else {
    linkAction = "select";
  }
}

const uriParts = [];
let uriParams = "";

let targetItem = item;
// 处理PDF打开行为
if (linkAction === "open-pdf") {
  uriParts.push("zotero://open-pdf");
  // 对于普通项目，查找最佳PDF附件
  if (item.isRegularItem()) {
    targetItem = (await item.getBestAttachments()).find((att) =>
      att.isPDFAttachment()
    );
  } 
  // 对于注释，链接到其所在PDF并定位到对应页面
  else if (item.isAnnotation()) {
    targetItem = item.parentItem;
    let pageIndex = 1;
    try {
      pageIndex = JSON.parse(item.annotationPosition).pageIndex + 1;
    } catch (e) {
      Zotero.warn(e);
    }
    uriParams = `?page=${pageIndex}&annotation=${item.key}`;
  }
} 
// 处理项目选中行为
else {
  uriParts.push("zotero://select");
  if (item?.isAnnotation()) {
    targetItem = item.parentItem;
  }
}

// 验证目标项目有效性
if (!targetItem && !collection) return "[Copy Zotero Link] 项目无效";

// 生成链接文本
let linkText;
if (collection) {
  // 集合链接使用集合名称作为文本
  linkText = collection.name;
} else if (item.isAttachment()) {
  // 附件使用其顶层项目的指定字段作为文本
  linkText = Zotero.Items.getTopLevel([item])[0].getField(linkTextField);
} else if (item.isAnnotation()) {
  // 注释链接文本包含源项目信息和注释内容
  linkText = `${targetItem.getField(linkTextField)}(${
    item.annotationComment || item.annotationText || "annotation"
  })`;
} else {
  // 普通项目使用指定字段作为文本
  linkText = item.getField(linkTextField);
}

// 构建链接的库/群组部分
let libraryType = (collection || item).library.libraryType;
if (libraryType === "user") {
  uriParts.push("library");
} else {
  uriParts.push(
    `groups/${Zotero.Libraries.get((collection || item).libraryID).groupID}`
  );
}

// 处理集合特定链接
if (useColl) {
  let coll = collection || Zotero.getActiveZoteroPane().getSelectedCollection();
  if (!!coll) uriParts.push(`collections/${coll.key}`);
}

// 添加项目标识部分
if (!collection) {
  uriParts.push(`items/${targetItem.key}`);
}

// 组合链接并添加参数
let uri = uriParts.join("/");
if (uriParams) {
  uri += uriParams;
}

// 处理Better Notes笔记链接
if (useNoteLink && item?.isNote() && Zotero.BetterNotes) {
  uri = Zotero.BetterNotes.api.convert.note2link(item);
}

// 将生成的链接复制到剪贴板
const clipboard = new Zotero.ActionsTags.api.utils.ClipboardHelper();
if (linkType == "html") {
  clipboard.addText(`<a href="${uri}">${linkText}</a>`, "text/unicode");
} else if (linkType == "md") {
  clipboard.addText(`[${linkText}](${uri})`, "text/unicode");
} else {
  clipboard.addText(uri, "text/unicode");
}

// 额外添加HTML格式到剪贴板（确保兼容性）
clipboard.addText(`<a href="${uri}">${linkText}</a>`, "text/html");

clipboard.copy();

return `[Copy Zotero Link] 链接 ${uri} 已复制。`;
```

其他设置建议：

`快捷键`​​：​`[无快捷键]`

`菜单项`​​：​`🔗复制链接`

条目菜单中 ✅️

阅读器菜单中 ✅️

注释菜单中 ✅️

‍

‍

‍

‍

‍

## 批量为多个条目基于Better Notes模板创建子笔记

`名称`​：批量模板笔记

`事件`​​：​`无`

`操作`​​：​`自定义脚本`

`数据`​：

```javascript
/**
 * 脚本功能：批量为多个条目基于Better Notes模板创建子笔记
 * 
 * 使用说明：
 * 1. 多选条目（可以选择多个文献条目）
 * 2. 运行此脚本
 * 3. 从模板列表中选择一个模板
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

其他设置建议：

`快捷键`​​：​`[无快捷键]`

`菜单项`​​：​`🗃️批量添加模板笔记`

条目菜单中 ✅️

‍

#### 自定义工具

[Zotero笔记模板生成器](https://stream-l.github.io/template-generator.html)![image](/images/image-20261113182128-di8pzqa.png)

#### 视频教程

[Zotero 笔记模板生成器:让模板定制零代码上手_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1fAkXBJEA7)

‍

‍

## 创建文献矩阵（元数据+标签批注）

`名称`​：创建文献矩阵

`事件`​​：​`无`

`操作`​​：​`自定义脚本`

`数据`​：

```javascript
/**
 * @author Stream-L
 * @date 2026-03-24
 * @refs https://github.com/windingwind/zotero-actions-tags/discussions/477
 * 脚本功能：从所有选中的条目中提取指定 PDF 附件内带有指定"注释标签"的注释（转换为 HTML），
 * 同时提取所有元数据字段，并将结果合并到一个表格中。
 * 
 * 使用说明：
 * 1. 在 Zotero 中，使用自带的 PDF 阅读器打开 PDF，并对需要的文字做高亮或注释，然后在注释的右侧面板中添加标签（tag），如"背景"、"材料"。
 * 2. 选中一个或多个条目后运行此脚本（使用传入的 items 或 item 变量）。
 * 3. 脚本会弹窗提示输入新笔记的标题和要提取的注释标签。
 * 4. 脚本会先自动删除每个条目中已生成的、包含这些标签关键字的提取注释笔记（避免重复）。
 * 5. 然后遍历每个条目，提取注释和所有元数据字段。
 * 6. 最后生成包含注释列和元数据列的表格笔记。
 * 
 * 表格结构：每行是一个条目，列包括：元数据字段列 + 注释标签列
 */

if (item) return; // 仅对所有选中项执行一次

// 避免重复声明错误
var Zotero = typeof Zotero !== 'undefined' ? Zotero : require("Zotero");
var window = typeof window !== 'undefined' ? window : require("window");
var console = typeof console !== 'undefined' ? console : require("console");

// 使用传入的 items 或 item 变量
let selectedItems = [];
if (typeof items !== "undefined" && items.length > 0) {
  selectedItems = items;
} else if (typeof item !== "undefined") {
  selectedItems = [item];
} else {
  window.alert("请先选择要处理的文献");
  return;
}

// 过滤掉附件和笔记，只保留有效条目
selectedItems = selectedItems.filter(item => !item.isAttachment() && !item.isNote());
if (selectedItems.length === 0) {
  window.alert("所选项目中没有有效的条目（可能都是附件或笔记）");
  return;
}

// 弹窗提示输入新笔记的标题
let noteTitle = window.prompt("请输入新笔记的标题：（默认使用当前时间）");
if (noteTitle === null) {
  // 用户点击了取消按钮
  return;
}
if (noteTitle.trim() === '') {
  // 用户留空，使用默认时间
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  noteTitle = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 创建进度窗口
let progressWindow = new Zotero.ProgressWindow({ closeOnClick: false });
progressWindow.changeHeadline("提取注释和元数据到表格");
progressWindow.show();

let progressIcon = 'chrome://zotero/skin/spinner-16px.png';
let itemProgress = new progressWindow.ItemProgress(progressIcon, noteTitle.substring(0, 60));
itemProgress.setProgress(0);
itemProgress.setText("⏳ 正在扫描注释标签...");
progressWindow.show();

/**
 * 从所有选中的条目中提取所有注释标签
 */
async function getAllAnnotationTags(items) {
  let allTags = new Set();
  
  for (let item of items) {
    if (item.isAttachment() || item.isNote()) {
      console.log(`[DEBUG] 跳过附件或笔记项目: ${item.id}`);
      continue;
    }
    
    const attachments = item.getAttachments();
    for (let attachmentId of attachments) {
      const attachment = await Zotero.Items.getAsync(attachmentId);
      if (attachment.attachmentContentType === "application/pdf") {
        const annots = attachment.getAnnotations();
        if (annots && annots.length > 0) {
          for (let annot of annots) {
            if (annot.getTags && Array.isArray(annot.getTags())) {
              let tagsOnAnnot = annot.getTags().map(tagObj => tagObj.tag);
              tagsOnAnnot.forEach(tag => allTags.add(tag));
            }
          }
        }
      }
    }
  }
  
  return Array.from(allTags).sort();
}

// 提取所有注释标签
let availableTags = await getAllAnnotationTags(selectedItems);
let skipAnnotations = false;

if (availableTags.length === 0) {
  itemProgress.setProgress(20);
  itemProgress.setText("⚠️ 未找到任何带标签的注释");
  let continueWithoutTags = window.confirm("未找到任何带标签的注释。是否仍然创建仅包含元数据的笔记？");
  if (!continueWithoutTags) {
    itemProgress.setError();
    itemProgress.setText("❌ 用户取消操作");
    progressWindow.startCloseTimer(3000);
    return;
  }
  skipAnnotations = true;
} else {
  itemProgress.setProgress(20);
  itemProgress.setText(`✓ 找到 ${availableTags.length} 个标签`);
}

// 让用户多选标签（如果有标签可选）
let tagSelection = null;
if (!skipAnnotations) {
  tagSelection = window.prompt(
    `找到以下注释标签：\n\n${availableTags.map((tag, idx) => `${idx + 1}. ${tag}`).join('\n')}\n\n请输入要提取的标签序号（用逗号分隔，如：1,3,5）\n或直接输入标签名称（用逗号分隔）\n输入 0 或留空可全选所有标签：`
  );

  if (tagSelection === null) {
    // 用户点击了取消按钮
    itemProgress.setError();
    itemProgress.setText("❌ 用户取消操作");
    progressWindow.startCloseTimer(3000);
    return;
  }
  
  // 如果用户留空，默认选择全部标签
  if (tagSelection.trim() === '') {
    tagSelection = '0';
  }
}

itemProgress.setProgress(25);
itemProgress.setText(skipAnnotations ? "⏳ 准备提取元数据..." : "⏳ 正在解析标签选择...");

// 解析用户输入
let annotationTags = [];

if (!skipAnnotations) {
  if (tagSelection.trim() === '0') {
    annotationTags = [...availableTags];
  } else {
    let inputs = tagSelection.split(/[,，;；]/).map(s => s.trim()).filter(s => s.length > 0);

    for (let input of inputs) {
      if (/^\d+$/.test(input)) {
        let index = parseInt(input) - 1;
        if (index >= 0 && index < availableTags.length) {
          annotationTags.push(availableTags[index]);
        }
      } else {
        if (availableTags.includes(input)) {
          annotationTags.push(input);
        }
      }
    }

    annotationTags = [...new Set(annotationTags)];
  }

  if (annotationTags.length === 0) {
    itemProgress.setError();
    itemProgress.setText("❌ 没有有效的标签选择");
    progressWindow.startCloseTimer(3000);
    return;
  }

  itemProgress.setProgress(30);
  itemProgress.setText(`✓ 已选择 ${annotationTags.length} 个标签: ${annotationTags.join(", ")}`);
} else {
  itemProgress.setProgress(30);
  itemProgress.setText("✓ 跳过注释提取，仅提取元数据");
}

// 定义所有要提取的元数据字段
const METADATA_FIELDS = [
  { name: "标题", variable: "title" },
  { name: "作者", variable: "creators", isSpecial: true },
  { name: "日期", variable: "date" },
  { name: "摘要", variable: "abstractNote" },
  { name: "期刊/出版物", variable: "publicationTitle" },
  { name: "标题翻译", variable: "titleTranslation" },
  { name: "摘要翻译", variable: "abstractTranslation" },
  { name: "项目链接（本地跳转）", variable: "null", isSpecial: true }
];

// 批注是否分行配置
const KEEP_ANNOTATION_LINE_BREAKS = false;

console.log(`[DEBUG] 总字段数: ${METADATA_FIELDS.length}`);
console.log(`[DEBUG] 注释标签数: ${annotationTags.length}`);

/**
 * 删除每个条目中已生成的、包含任一指定注释标签关键字的提取注释笔记
 */
async function deleteIndividualAnnotationNotes(items, annotationTags) {
  itemProgress.setProgress(35);
  itemProgress.setText("⏳ 正在删除旧笔记...");
  
  let deletedCount = 0;
  for (let item of items) {
    if (item.isAttachment() || item.isNote()) {
      console.log(`[DEBUG] 跳过附件或笔记项目: ${item.id}`);
      continue;
    }
    
    const noteIDs = item.getNotes();
    console.log(`[DEBUG] 条目 "${item.getField("title")}" 有 ${noteIDs.length} 个笔记`);
    for (let id of noteIDs) {
      let note = Zotero.Items.get(id);
      let noteHTML = note.getNote();
      if (noteHTML && noteHTML.startsWith('<div data-citation-items')) {
        if (annotationTags.some(tag => noteHTML.includes(tag))) {
          Zotero.Items.trashTx(id);
          deletedCount++;
          console.log(`[DEBUG] 删除旧笔记: ${note.getNoteTitle()}`);
        }
      }
    }
  }
  
  if (deletedCount > 0) {
    itemProgress.setText(`✓ 已删除 ${deletedCount} 个旧笔记`);
  }
}

/**
 * 从单个条目中，提取其 PDF 附件中所有带有 annotationTags 中任意一个标签的注释
 */
async function extractAnnotationsFromItem(item) {
  let annotationsObj = {};
  annotationTags.forEach(tag => {
    annotationsObj[tag] = "";
  });
  
  if (item.isAttachment() || item.isNote()) {
    console.log(`[DEBUG] 跳过附件或笔记项目: ${item.id}`);
    return annotationsObj;
  }
  
  const attachments = item.getAttachments();
  console.log(`[DEBUG] 条目 "${item.getField("title")}" 有 ${attachments.length} 个附件`);
  
  let foundAnnotationsCount = 0;
  for (let attachmentId of attachments) {
    const attachment = await Zotero.Items.getAsync(attachmentId);
    if (attachment.attachmentContentType === "application/pdf") {
      const annots = attachment.getAnnotations();
      console.log(`[DEBUG] PDF附件有 ${annots ? annots.length : 0} 个注释`);
      if (annots && annots.length > 0) {
        for (let annot of annots) {
          if (annot.getTags && Array.isArray(annot.getTags())) {
            let tagsOnAnnot = annot.getTags().map(tagObj => tagObj.tag);
            for (let wantedTag of annotationTags) {
              if (tagsOnAnnot.includes(wantedTag)) {
                foundAnnotationsCount++;
                try {
                  let annotJSON = await Zotero.Annotations.toJSON(annot);
                  let res = Zotero.EditorInstanceUtilities.serializeAnnotations([
                    { ...annotJSON, attachmentItemID: annot.parentID }
                  ]);
                  let cleanHTML = res.html;
                  if (cleanHTML.startsWith('<div') && cleanHTML.endsWith('</div>')) {
                    cleanHTML = cleanHTML.replace(/^<div[^>]*>/, '').replace(/<\/div>$/, '');
                  }
                  if (!KEEP_ANNOTATION_LINE_BREAKS) {
                    cleanHTML = cleanHTML
                      .replace(/<br\s*\/?>/gi, ' ')
                      .replace(/<\/p>\s*<p[^>]*>/gi, ' ')
                      .replace(/<\/?p[^>]*>/gi, ' ')
                      .replace(/\s+/g, ' ')
                      .trim();
                  }
                  annotationsObj[wantedTag] += cleanHTML;
                  console.log(`[DEBUG] 找到标签"${wantedTag}"的注释`);
                } catch (error) {
                  console.error("转换注释为 HTML 时出错:", error);
                }
              }
            }
          }
        }
      }
    }
  }
  
  console.log(`[DEBUG] 条目 "${item.getField("title")}" 共找到 ${foundAnnotationsCount} 个匹配的注释`);
  return annotationsObj;
}

/**
 * 从条目中提取单个字段的值
 */
function extractFieldValue(item, field) {
  try {
    if (field.isSpecial) {
      switch (field.name) {
        case "作者":
          let creators = item.getCreators();
          if (!creators || creators.length === 0) return "";
          return creators.map(c => {
            if (c.firstName && c.lastName) {
              return `${c.lastName}, ${c.firstName}`;
            } else if (c.name) {
              return c.name;
            } else if (c.lastName) {
              return c.lastName;
            } else {
              return "";
            }
          }).filter(n => n).join("; ");
        
        case "文献类型":
          return Zotero.ItemTypes.getLocalizedString(item.itemTypeID) || item.itemType || "";
        
        case "附件数量":
          let attachments = Zotero.Items.get(item.getAttachments());
          return attachments ? attachments.length.toString() : "0";
        
        case "子笔记数量":
          let notes = item.getNotes();
          return notes ? notes.length.toString() : "0";
        
        case "项目键":
          return item.key || "";

        case "项目链接（本地跳转）":
          let key = item.key || "";
          if (key) {
            let itemLink = "zotero://select/library/items/" + key;
            return "<a href='" + itemLink + "'>" + itemLink + "</a>";
          }
          return "";
        
        case "项目ID":
          return item.id ? item.id.toString() : "";
        
        case "图书馆ID":
          return item.libraryID ? item.libraryID.toString() : "";
        
        case "标签":
          let tags = item.getTags();
          if (!tags || tags.length === 0) return "";
          return tags.map(t => t.tag).join(", ");
        
        case "第一个附件名称":
          let attList = Zotero.Items.get(item.getAttachments());
          if (!attList || attList.length === 0) return "";
          return attList[0].getField("title") || "";
        
        case "附件链接":
          let attList2 = Zotero.Items.get(item.getAttachments());
          if (!attList2 || attList2.length === 0) return "";
          let firstAtt = attList2[0];
          if (firstAtt.isFileAttachment()) {
            return `zotero://open-pdf/library/items/${firstAtt.key}`;
          } else if (firstAtt.isLinkAttachment()) {
            return firstAtt.getField("url") || "";
          }
          return "";
        
        default:
          return "";
      }
    }
    
    if (!field.variable) {
      return "";
    }
    
    let value = item.getField(field.variable, false, true);
    return value || "";
    
  } catch (error) {
    console.log(`[DEBUG] 提取字段 "${field.name}" 失败:`, error);
    return "";
  }
}

/**
 * 从单个条目中提取所有元数据
 */
function extractMetadataFromItem(item) {
  let metadata = {};
  
  for (let field of METADATA_FIELDS) {
    metadata[field.name] = extractFieldValue(item, field);
  }
  
  return metadata;
}

/**
 * 主处理函数：提取所有条目的注释和元数据并生成表格
 */
async function combineAnnotationsAndMetadata(items) {
  itemProgress.setProgress(40);
  itemProgress.setText(`⏳ 正在处理 ${items.length} 个条目...`);
  
  let tableData = [];
  let processedCount = 0;
  
  for (let item of items) {
    if (item.isAttachment() || item.isNote()) {
      console.log(`[DEBUG] 跳过附件或笔记项目: ${item.id}`);
      continue;
    }
    
    let title = item.getField("title") || "无标题";
    console.log(`[DEBUG] 正在处理条目: ${title}`);
    
    processedCount++;
    let progress = 40 + Math.floor((processedCount / items.length) * 40);
    itemProgress.setProgress(progress);
    itemProgress.setText(`⏳ 正在提取数据 (${processedCount}/${items.length}): ${title.substring(0, 30)}...`);
    
    try {
      let itemAnnotations = await extractAnnotationsFromItem(item);
      let metadata = extractMetadataFromItem(item);
      tableData.push({ 
        annotations: itemAnnotations,
        metadata: metadata
      });
    } catch (error) {
      console.error(`处理文献 "${title}" 时出错:`, error);
    }
  }
  
  if (tableData.length === 0) {
    itemProgress.setError();
    itemProgress.setText("❌ 未能提取任何数据");
    progressWindow.startCloseTimer(4000);
    return;
  }
  
  itemProgress.setProgress(80);
  itemProgress.setText(`✓ 已提取 ${tableData.length} 个条目的数据`);
  
  // 构建 HTML 表格
  let combinedHTML = `<h1>${noteTitle}</h1>\n`;
  combinedHTML += `<p>共 ${tableData.length} 个条目，${METADATA_FIELDS.length} 个元数据字段，${annotationTags.length} 个注释标签</p>\n`;
  combinedHTML += `<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">\n`;
  
  // 表头：先是元数据字段列，后是注释标签列
  combinedHTML += `<tr style="background-color: #f0f0f0; font-weight: bold;">`;
  
  for (let field of METADATA_FIELDS) {
    combinedHTML += `<th style="text-align: left; padding: 8px; white-space: nowrap;">${field.name}</th>`;
  }
  
  annotationTags.forEach(tag => {
    combinedHTML += `<th style="text-align: left; padding: 8px; white-space: nowrap; background-color: #e8f4f8;">${tag}</th>`;
  });
  
  combinedHTML += `</tr>\n`;
  
  // 数据行
  tableData.forEach((row, index) => {
    let bgColor = index % 2 === 0 ? "#ffffff" : "#f9f9f9";
    combinedHTML += `<tr style="background-color: ${bgColor};">`;
    
    for (let field of METADATA_FIELDS) {
      let cellValue = row.metadata[field.name] || "";
      if (field.name !== "项目链接（本地跳转）") {
        cellValue = cellValue.replace(/&/g, "&amp;")
                             .replace(/</g, "&lt;")
                             .replace(/>/g, "&gt;")
                             .replace(/"/g, "&quot;")
                             .replace(/'/g, "&#39;");
      }
      
      let displayValue = cellValue;
      
      combinedHTML += `<td style="padding: 8px; vertical-align: top;">${displayValue}</td>`;
    }
    
    annotationTags.forEach(tag => {
      let cellContent = row.annotations[tag] || "";
      combinedHTML += `<td style="padding: 8px; vertical-align: top;">${cellContent}</td>`;
    });
    
    combinedHTML += `</tr>\n`;
  });
  
  combinedHTML += `</table>\n`;
  
  itemProgress.setProgress(85);
  itemProgress.setText("⏳ 正在创建笔记...");
  
  let currentItem = items[0];
  let libraryID = currentItem.libraryID;
  console.log(`[DEBUG] 库ID: ${libraryID}`);
  
  let library = Zotero.Libraries.get(libraryID);
  console.log(`[DEBUG] 库名称: ${library.name}, 可编辑: ${library.editable}`);
  if (!library.editable) {
    itemProgress.setError();
    itemProgress.setText("❌ 该库为只读状态，无法创建笔记");
    progressWindow.startCloseTimer(4000);
    return null;
  }
  
  let collectionID = null;
  try {
    let zoteroPane = Zotero.getActiveZoteroPane();
    if (zoteroPane) {
      let selectedCollection = zoteroPane.getSelectedCollection(true);
      if (selectedCollection) {
        collectionID = selectedCollection;
        console.log(`[DEBUG] 当前分类ID: ${collectionID}`);
      }
    }
  } catch (e) {
    console.log("[DEBUG] 无法获取当前分类:", e);
  }
  
  itemProgress.setProgress(90);
  itemProgress.setText("⏳ 正在保存笔记...");
  
  let noteItem = new Zotero.Item("note");
  noteItem.libraryID = libraryID;
  noteItem.parentID = null;
  console.log(`[DEBUG] 笔记parentID设置为null(独立笔记)`);
  
  if (collectionID) {
    noteItem.addToCollection(collectionID);
    console.log(`[DEBUG] 笔记已添加到分类: ${collectionID}`);
  }
  
  noteItem.setNote(combinedHTML);
  console.log(`[DEBUG] 笔记内容已设置,长度: ${combinedHTML.length}`);
  
  await noteItem.saveTx();
  console.log(`[DEBUG] 笔记已保存,ID: ${noteItem.id}`);
  
  itemProgress.setProgress(100);
  itemProgress.setText(`✅ 成功创建笔记: ${noteTitle}`);
  progressWindow.startCloseTimer(3000);
  
  return noteItem;
}

// 先删除旧的提取笔记，再合并生成新的独立笔记
deleteIndividualAnnotationNotes(selectedItems, annotationTags).then(() => {
  combineAnnotationsAndMetadata(selectedItems).then((noteItem) => {
    if (!noteItem) {
      itemProgress.setError();
      itemProgress.setText("❌ 处理过程中未能创建笔记");
      progressWindow.startCloseTimer(4000);
    }
  }).catch((error) => {
    console.error("合并注释和元数据时出错:", error);
    itemProgress.setError();
    itemProgress.setText(`❌ 错误: ${error.message}`);
    progressWindow.startCloseTimer(5000);
  });
}).catch((error) => {
  console.error("删除旧笔记时出错:", error);
  itemProgress.setError();
  itemProgress.setText(`❌ 错误: ${error.message}`);
  progressWindow.startCloseTimer(5000);
});
```

其他设置建议：

`快捷键`​​：​`[无快捷键]`

`菜单项`​​：​`🗃️文献矩阵`

条目菜单中 ✅️

‍

#### 自定义工具

[Zotero文献矩阵脚本生成器](https://stream-l.github.io/matrix-script-generator.html)

![image](/images/image-20261113181835-6gh3vmg.png)

#### 视频教程

[Zotero文献矩阵(元数据+注释)脚本配置及使用教程_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1WFCMBqEgb)

‍
