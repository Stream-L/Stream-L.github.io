# Hugo 三级 Section 结构说明

## 概述

根据 Hugo 官方文档和社区最佳实践,我为你的博客创建了一个完整的三级 section 结构示例。

## 知识要点

### 1. Section 的概念

- **Section** 就是内容目录(文件夹),用于组织内容
- Hugo 默认只为顶级目录创建 section
- 要创建嵌套的 section,**必须在子目录中添加 `_index.md` 文件**

### 2. URL 生成规则

根据 Hugo 的路由规则,目录结构会自动映射为 URL:

| 文件路径 | 生成的 URL |
|---------|-----------|
| `content/knowledge/_index.md` | `/knowledge/` |
| `content/knowledge/programming/_index.md` | `/knowledge/programming/` |
| `content/knowledge/programming/python/_index.md` | `/knowledge/programming/python/` |
| `content/knowledge/programming/python/basic-syntax.md` | `/knowledge/programming/python/basic-syntax/` |

### 3. 关键文件 `_index.md`

`_index.md` 文件的作用:
- 标识该目录为一个 section
- 生成该 section 的列表页面
- 可以包含该 section 的介绍内容
- 可以配置菜单项

## 创建的三级结构

```
content/
└── knowledge/              (一级 section: 知识库)
    ├── _index.md          ✓ 必需,标识为 section
    ├── programming/        (二级 section: 编程技术)
    │   ├── _index.md      ✓ 必需,创建嵌套 section
    │   ├── python/         (三级 section: Python)
    │   │   ├── _index.md  ✓ 必需,创建三级 section
    │   │   ├── basic-syntax.md
    │   │   └── advanced-features.md
    │   └── javascript/     (三级 section: JavaScript)
    │       ├── _index.md  ✓ 必需
    │       └── es6-features.md
    └── data-science/       (二级 section: 数据科学)
        ├── _index.md      ✓ 必需
        └── numpy/          (三级 section: NumPy)
            ├── _index.md  ✓ 必需
            └── array-operations.md
```

## 访问路径

### 从主页访问

1. **通过导航菜单访问**:
   - 在 `knowledge/_index.md` 的 front matter 中添加了 `menu` 配置
   - 主页顶部会显示"知识库"菜单项
   - 点击即可访问 `/knowledge/`

2. **直接访问 URL**:
   - 一级: http://localhost:62670/knowledge/
   - 二级: http://localhost:62670/knowledge/programming/
   - 三级: http://localhost:62670/knowledge/programming/python/
   - 文章: http://localhost:62670/knowledge/programming/python/basic-syntax/

### 列表页面

每个 section 都会自动生成列表页面,显示:
- 该 section 的介绍(来自 `_index.md`)
- 子 section 列表
- 该 section 下的文章列表

## Front Matter 配置

### Section 首页 (`_index.md`)

```yaml
---
title: "知识库"
description: "个人知识库描述"
date: 2025-11-05
menu:                    # 添加到主菜单
    main:
        weight: 2        # 菜单排序权重
        params:
            icon: book   # 菜单图标
---
```

### 文章页面

```yaml
---
title: "文章标题"
description: "文章描述"
date: 2025-11-05
slug: "custom-url"     # 自定义 URL 段
categories:
    - 编程
tags:
    - Python
---
```

## 模板选择逻辑

Hugo 会按以下顺序查找模板:

1. `layouts/knowledge/list.html` - 特定 section 模板
2. `layouts/_default/list.html` - 默认列表模板
3. `themes/hugo-theme-stack/layouts/_default/list.html` - 主题模板

## 最佳实践

### 1. 目录命名
- 使用英文或拼音作为目录名(服务器兼容性)
- 使用小写和连字符: `data-science` 而非 `DataScience`
- 中文内容在 `_index.md` 的 `title` 中定义

### 2. 内容组织
- 保持层级清晰,避免过深嵌套(建议不超过 3-4 层)
- 相关内容放在同一 section 下
- 每个 section 都应有 `_index.md` 文件

### 3. URL 优化
- 使用 `slug` 自定义友好的 URL
- 使用 `aliases` 设置旧 URL 重定向
- 考虑 SEO,使用描述性 URL

### 4. 导航设置
```yaml
# 在 _index.md 中添加到主菜单
menu:
    main:
        weight: 2          # 控制菜单顺序
        params:
            icon: book     # 图标(依主题而定)
```

## 测试验证

### 查看生成的页面
```bash
# 启动开发服务器
hugo server -D

# 访问各级 section
http://localhost:1313/knowledge/
http://localhost:1313/knowledge/programming/
http://localhost:1313/knowledge/programming/python/
```

### 检查路由
```bash
# 列出所有页面 URL
hugo list all

# 查看配置
hugo config
```

## 扩展示例

### 添加新的三级 section

```bash
# 1. 创建目录结构
mkdir -p content/knowledge/programming/golang

# 2. 创建 _index.md
cat > content/knowledge/programming/golang/_index.md << 'EOF'
---
title: "Go 语言学习"
description: "Go 语言学习笔记"
date: 2025-11-05
---

Go 语言学习内容。
EOF

# 3. 创建文章
hugo new knowledge/programming/golang/getting-started.md
```

### 自定义 Permalinks

在 `config/_default/config.toml` 中:

```toml
[permalinks]
  knowledge = "/kb/:sections/:slug/"
```

这会将 URL 从 `/knowledge/programming/python/basic-syntax/` 
改为 `/kb/programming/python/basic-syntax/`

## 总结

三级 section 结构的关键点:
1. ✓ **每级都需要 `_index.md`** 文件
2. ✓ 目录结构自动映射为 URL
3. ✓ 通过 menu 配置添加到主导航
4. ✓ 使用 Hugo 主题的列表模板自动生成页面
5. ✓ 灵活使用 front matter 控制 URL 和行为

现在你的博客已经有了一个完整的三级 section 结构,可以从主页导航访问!
