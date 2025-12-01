---
title: Excel 图表导出宏（Chart.Name 保留版）
slug: excel-chart-export-macro-chartname-reserved-version-1nsij6
url: /post/excel-chart-export-macro-chartname-reserved-version-1nsij6.html
date: '2025-11-26 18:25:56+08:00'
lastmod: '2025-11-26 22:36:09+08:00'
tags:
  - Office
  - Excel
  - 论文
  - 科研
keywords: Office,Excel,论文,科研
toc: true
isCJKLanguage: true
---



# Excel 图表导出宏（Chart.Name 保留版）

## 功能概要

该宏用于 **批量导出 Excel 工作簿中的所有图表**（嵌入式图表和独立图表工作表），导出文件名基于 **Chart.Name**，支持自定义前缀删除和文件格式选择（SVG/PNG/JPG），导出路径默认在 **当前工作簿目录下创建的文件夹**。

 **注意当前只能处理第一个sheet中的图表** 

---

## 使用场景

- 已经在 Excel 中完成图表设计，想快速导出用于论文、报告或演示
- 希望保留图表在 Excel 中命名的名称
- 需要统一导出到指定格式（SVG/PNG/JPG），并自动处理非法字符
- 避免重复手动保存图表，提高批量处理效率

---

## 使用方法

1. 打开 Excel 文件
2. 创建一些图表 **Alt+F10**打开**选择窗格**自定义图表名称 或者 **开始>编辑>查找和选择>选择窗格**
3. 按 **Alt + F11** 打开 VBA 编辑器 或者视图>宏>编辑
4. 插入模块：**Insert → Module**
5. 将宏代码粘贴到模块中
6. 根据需要修改 **宏开头的自定义参数**
7. 运行宏 `Export_Charts_UseChartName_Customizable`
8. 导出文件将保存在：

    ```
    当前工作簿所在目录\exportFolderName\
    ```

---

## 使用示范

![image](https://s2.loli.net/2025/11/26/Wn9IvMD5HRAyiFm.png)

Alt + F11 调出宏 插入 模块 Ctrl+S 保存提示普通工作簿不能保存宏文件 可以按否单独保存为一个存宏脚本的文件

![image](https://s2.loli.net/2025/11/26/NfZaceUlEgHvAB2.png)

再打开需要画图的文件就可以调用这个带宏文件的宏

![image](https://s2.loli.net/2025/11/26/jHyYWnrO2FA9Pis.png)

![image](https://s2.loli.net/2025/11/26/UqCI2MhKnaWmkSe.png)

导出的文件：

![image](https://s2.loli.net/2025/11/26/O9TX3LwG6Y2zQab.png)

## 参数说明表

|参数|说明|示例 / 可选值|
| ------| --------------------------------------------------------| ------------------------|
|​`prefixToRemove`|要删除的 Chart.Name 前缀，用于去掉系统或自定义多余文字|​`"Sheet1 "`​，留空`""`表示不删除|
|​`exportFolderName`|导出文件夹名称，会自动创建在当前工作簿目录下|​`"export_svg"`|
|​`exportFormat`|导出文件格式，可选择`"SVG"`​、`"PNG"`​、`"JPG"`|​`"SVG"`|

> ​**注意**​：宏会自动替换文件名中非法字符（`\ / : * ? " < > |`​）为 `_`，避免保存失败。

---

## 代码内容

```vb
'===========================
' 图表导出宏（最终版，不带 Sheet 名）
' 默认图表名 → 使用标题；无标题 → 用原名
' 支持自定义前缀去除 + 格式选择
'===========================

Sub Export_Charts_UseChartName_Customizable()

    '======== 用户可自定义参数 ========
    ' 保留用户自定义前缀
    Dim customPrefixToRemove As String: customPrefixToRemove = "结果画图 "
    Dim exportFormat As String: exportFormat = "SVG"  ' 可选：SVG / PNG / JPG
    Dim exportFolderName As String: exportFolderName = "export_charts"
    '=================================

    Dim wbPath As String
    Dim exportPath As String
    Dim ws As Worksheet
    Dim chObj As ChartObject
    Dim ch As Chart
    Dim chartName As String
    
    ' ★ 新增逻辑：设置所有需要尝试移除的前缀
    Dim firstSheetName As String
    Dim prefixesToTry(1 To 4) As String ' 包含用户前缀、第一个Sheet名(带空格/不带空格)
    
    If ThisWorkbook.Sheets.Count >= 1 Then
        ' 获取第一个工作表名称
        firstSheetName = ThisWorkbook.Sheets(1).Name
    Else
        firstSheetName = ""
    End If
    
    ' 填充要尝试移除的前缀数组
    prefixesToTry(1) = customPrefixToRemove      ' 1. 用户自定义前缀 (如 "结果画图 ")
    prefixesToTry(2) = firstSheetName & " "      ' 2. 第一个工作表名 + 空格 (如 "Sheet 1 ")
    prefixesToTry(3) = firstSheetName            ' 3. 第一个工作表名 (如 "Sheet 1")
    prefixesToTry(4) = firstSheetName & " " & customPrefixToRemove ' 4. Sheet名 + 空格 + 用户前缀 (复合情况)


    ' 获取当前工作簿路径
    wbPath = ThisWorkbook.Path
    If wbPath = "" Then
        MsgBox "请先保存 Excel 文件，再运行宏。", vbExclamation
        Exit Sub
    End If

    ' 创建导出文件夹
    exportPath = wbPath & "\" & exportFolderName
    If Dir(exportPath, vbDirectory) = "" Then MkDir exportPath

    '=========== 遍历嵌入式图表 ===========
    For Each ws In ThisWorkbook.Worksheets
        For Each chObj In ws.ChartObjects
            Set ch = chObj.Chart

            chartName = GetCleanChartName(ch)  ' 获取名称 (优先标题，已移除 Sheet! 前缀)
            
            ' ★ 依次尝试移除所有预设前缀
            chartName = TryRemovePrefixes(chartName, prefixesToTry)
            
            chartName = CleanFileName(chartName)
            
            ' 确保 chartName 不为空
            If Trim(chartName) = "" Then chartName = "UnnamedChart_" & ch.Name

            ch.Export Filename:=exportPath & "\" & chartName & "." & LCase(exportFormat), _
                     FilterName:=exportFormat
        Next chObj
    Next ws

    '=========== 遍历独立的图表工作表 ===========
    For Each ch In ThisWorkbook.Charts
        chartName = GetCleanChartName(ch)
        
        ' ★ 依次尝试移除所有预设前缀
        chartName = TryRemovePrefixes(chartName, prefixesToTry)
        
        chartName = CleanFileName(chartName)
        
        If Trim(chartName) = "" Then chartName = "UnnamedChart_" & ch.Name

        ch.Export Filename:=exportPath & "\" & chartName & "." & LCase(exportFormat), _
                 FilterName:=exportFormat
    Next ch

    MsgBox "所有图表已成功导出到：" & vbCrLf & exportPath, vbInformation
End Sub


'========================== 工具函数区 ==========================

' 根据规则获取图表名字：
' 默认名称 → 图表标题 → 原名
Function GetCleanChartName(ch As Chart) As String
    Dim nm As String
    nm = ch.Name
    
    ' ★ 去掉可能的 Sheet 前缀，例如 "Sheet1!Chart 1" → "Chart 1"
    If InStr(nm, "!") > 0 Then nm = Mid(nm, InStr(nm, "!") + 1)
    
    ' 检查是否为 Excel 默认图表名（Chart 1 / 图表 1）
    If IsDefaultChartName(nm) Then
        ' 如果有标题，使用标题
        If ch.HasTitle Then
            If Trim(ch.ChartTitle.Text) <> "" Then
                GetCleanChartName = Trim(ch.ChartTitle.Text)
                Exit Function
            End If
        End If
        ' 无标题 → 返回原名
        GetCleanChartName = nm
    Else
        ' 非默认名称 → 保留用户命名
        GetCleanChartName = nm
    End If
End Function


' 判断名称是否为 Excel 默认图表名
Function IsDefaultChartName(nm As String) As Boolean
    Dim s As String
    s = Replace(LCase(nm), " ", "")  ' 去空格统一格式

    If s Like "chart#" Or s Like "chart##" Then
        IsDefaultChartName = True
    ElseIf s Like "图表#" Or s Like "图表##" Then
        IsDefaultChartName = True
    Else
        IsDefaultChartName = False
    End If
End Function


' 删除指定前缀
Function RemovePrefix(txt As String, prefix As String) As String
    If prefix = "" Then
        RemovePrefix = txt
    ElseIf Left(txt, Len(prefix)) = prefix Then
        RemovePrefix = Mid(txt, Len(prefix) + 1)
    Else
        RemovePrefix = txt
    End If
End Function


' 替换非法字符
Function CleanFileName(fname As String) As String
    Dim invalidChars As Variant
    Dim ch As Variant
    invalidChars = Array("\", "/", ":", "*", "?", """", "<", ">", "|")

    For Each ch In invalidChars
        fname = Replace(fname, ch, "_")
    Next ch

    CleanFileName = Trim(fname)
End Function

' 新增：依次尝试移除数组中的前缀
' 修改后的 TryRemovePrefixes 函数
Function TryRemovePrefixes(txt As String, prefixes As Variant) As String
    Dim currentTxt As String
    Dim p As Variant
    
    currentTxt = txt
    
    For Each p In prefixes
        If p <> "" Then
            ' ★ 重点修改：使用 CStr() 强制转换，避免 ByRef 错误
            currentTxt = RemovePrefix(currentTxt, CStr(p))
        End If
    Next p
    
    TryRemovePrefixes = currentTxt
End Function

```

‍

![image](https://s2.loli.net/2025/12/01/dzKgZ9cpP7Yn2SW.png)
