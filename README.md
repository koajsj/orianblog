# Orian's Blog

Orian 的个人博客静态站点（设计与开发笔记）。本仓库使用 **原生 HTML / CSS / JavaScript** 构建，可直接通过浏览器打开或部署到 GitHub Pages。

## 预览
- 本地预览：直接打开 `index.html`
- 线上部署：推荐使用 GitHub Pages（见下文）

## 项目结构
- `index.html`：主页
- `css/style.css`：站点样式
- `js/main.js`：交互脚本

## 本地运行
本项目不依赖 Node.js / npm。

### 方式 1：直接打开
双击打开 `index.html` 即可。

### 方式 2：使用本地静态服务器（推荐）
避免部分浏览器对本地文件（file://）的限制。

```bash
# Python 3
python -m http.server 3000

# 或 Node.js（可选）
npx serve .
```

然后访问：`http://localhost:3000`

## 部署到 GitHub Pages
1. 进入仓库 **Settings** → **Pages**
2. **Build and deployment** 选择：
   - Source: **Deploy from a branch**
   - Branch: `main` / `(root)`
3. 保存后等待部署完成，即可通过 Pages 提供的地址访问。

## 技术栈
- HTML5
- CSS3
- JavaScript
- Font Awesome（CDN）
- Google Fonts（Sora）

## License
当前仓库未包含许可证文件（如需开源协议，请添加 `LICENSE` 并在此处更新说明）。