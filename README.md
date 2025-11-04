# [Stream-L的博客](https://stream-l.github.io/)

# Hugo Theme Stack Blog

This is a blog built with [Hugo](https://gohugo.io/) and [Hugo Theme Stack](https://github.com/CaiJimmy/hugo-theme-stack).

## Quick Start

1. Install Hugo Extended (v0.120.0 or later)
2. Clone this repository
3. Run `hugo mod get` to download the theme
4. Run `hugo server` to start the development server
5. Open [http://localhost:1313](http://localhost:1313) in your browser

## Configuration

Edit files in the `config/_default/` directory to customize your site:

- `config.toml` - Site configuration
- `menu.toml` - Navigation menu
- `params.toml` - Theme parameters
- `module.toml` - Hugo modules configuration

## Creating Content

Create a new post:

```bash
hugo new content/post/my-first-post/index.md
```

## Build

Build the site for production:

```bash
hugo --minify
```

The generated site will be in the `public/` directory.

## RSS Feed / 播客订阅

本站使用 Hugo 内置 RSS 功能,自动生成最新的 10 篇文章订阅源:

**订阅地址**: `https://stream-l.github.io/podcast.xml`

RSS feed 包含:

- 文章标题
- 发布日期
- 文章链接
- 文章描述
- 题图(如果有)

RSS feed 会在每次 Hugo 构建时自动生成。

## License

MIT License - see LICENSE file for details.

## Docs

[Introduction | Stack](https://stack.jimmycai.com/config/)

## Icons

[Tabler Icons: 4950+ free vector icons for web design](https://tabler.io/icons)

[Download PNG &amp; SVG Icons: Your Ultimate Icon Library](https://www.streamlinehq.com/)

use id and copy file to themes\hugo-theme-stack\assets\icons

## Themes

[Themes | Hexo](https://hexo.io/themes/)
