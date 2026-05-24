# Orian's Blog

一个基于 `HTML + CSS + JavaScript` 的静态个人博客，重点放在简洁的阅读体验、轻量交互和低维护成本。

## 主要功能

- 首页、文章列表页、文章详情页
- 主题切换、语言切换
- 文章搜索、排序、最近文章展示
- 文章详情页目录、阅读进度、上一篇 / 下一篇、点赞、收藏、复制链接
- 本地评论，评论存储在浏览器 `localStorage`
- `SEO` 元数据、`robots.txt`、`sitemap.xml`
- 减少动画干扰，支持 `prefers-reduced-motion`

## 项目结构

- `index.html`：首页
- `articles.html`：文章归档页
- `article.html`：文章详情页
- `css/style.css`：全站样式
- `js/articles-data.js`：文章数据源
- `js/blog-utils.js`：文章规范化、日期格式化、统计与语言状态
- `js/articles-home.js`：首页和归档页渲染、搜索、排序
- `js/article-page.js`：文章详情页渲染、目录、评论与交互
- `js/main.js`：主题切换、语言切换、全站动画
- `tools/site.mjs`：构建、检查、生成 `robots.txt` 和 `sitemap.xml`
- `deploy/debian/bootstrap.sh`：Debian VPS 一键部署脚本

## 本地预览

静态站点可以直接打开 `index.html` 预览，也可以用本地静态服务器查看。

## 构建脚本

```bash
npm run build
npm run lint
npm test
```

- `build`：检查核心脚本，并生成 `robots.txt`、`sitemap.xml`
- `lint`：只做语法检查
- `test`：先构建，再检查生成结果

如果站点基础地址变化，可以通过环境变量或参数覆盖：

```bash
SITE_BASE_URL=https://example.com/blog/ npm run build
node tools/site.mjs build --base-url=https://example.com/blog/
```

## 发布文章

1. 在 `js/articles-data.js` 里新增一篇文章。
2. 填好 `slug`、标题、摘要、正文和日期。
3. 运行 `npm run build`。
4. 提交并推送到 GitHub。
5. 如果使用 GitHub Pages，推送后会自动发布。
6. 如果使用 Debian VPS，服务器会按定时任务自动拉取并刷新站点。

## 部署教程

这套站点的部署顺序是固定的：先把域名解析到 VPS，再在 VPS 上执行一键脚本，最后验证自动同步和证书是否正常。

### 1. 准备域名解析

先在域名注册商或 DNS 管理后台打开解析设置，添加下面两条记录：

- `A` 记录：主机记录填 `@`，记录值填 VPS 公网 IP
- `CNAME` 记录：主机记录填 `www`，指向 `@`

如果注册商不支持 `www` 指向 `@`，可以直接给 `www` 再加一条 `A` 记录。

### 2. 如果使用 Cloudflare

如果你把 DNS 托管到 Cloudflare，先把域名接入 Cloudflare，再到注册商后台把 NS 记录改成 Cloudflare 提供的两条名称服务器。等状态变成 `Active` 后，再继续。

在 Cloudflare 面板里建议这样设置：

- `A` 记录和 `CNAME` 记录先保持 `DNS only`
- `SSL/TLS` 模式设为 `Full` 或 `Full (strict)`
- 等 VPS 证书签发成功后，再按需开启代理

### 3. 修改仓库里的域名配置

如果你不是部署到默认示例域名，需要同时修改这两个位置：

- `deploy/debian/bootstrap.sh` 里的 `DOMAIN`、`WWW_DOMAIN`、`BASE_URL`
- `tools/site.mjs` 里默认的站点基础地址

改完后重新构建，确保站内链接、`robots.txt` 和 `sitemap.xml` 都使用新域名。

### 4. 在 VPS 上执行部署

前提确认 `257823.xyz` 和 `www.257823.xyz` 已经解析到 VPS 以后，直接在 Debian VPS 上执行：

```bash
curl -fsSL https://raw.githubusercontent.com/koajsj/orianblog/main/deploy/debian/bootstrap.sh | sudo bash
```

这个脚本会自动完成：

- 安装 `git`、`nginx`、`nodejs`、`npm`、`certbot`
- 克隆仓库到 `/var/www/257823.xyz/html`
- 运行 `npm run build`
- 自动生成 `robots.txt` 和 `sitemap.xml`
- 配置 `Nginx`
- 启动 `systemd` 定时同步
- 尝试自动签发 `HTTPS` 证书

部署完成后，服务器会每 5 分钟自动拉取 GitHub 最新代码并刷新站点。

### 5. 验证部署

如果你想立刻手动触发一次同步，只需要运行：

```bash
sudo systemctl start orianblog-sync.service
```

如果证书签发失败，通常是域名解析还没有生效。等 `A` 记录生效后，再执行一次上面的同步命令即可。

### 6. 删除旧配置

如果你后面不再使用旧域名，先删除 DNS 记录，再清理 VPS 上的站点配置和证书。

```bash
sudo bash -lc 'systemctl stop orianblog-sync.timer orianblog-sync.service; systemctl disable orianblog-sync.timer; rm -f /etc/systemd/system/orianblog-sync.service /etc/systemd/system/orianblog-sync.timer; systemctl daemon-reload; rm -f /etc/nginx/sites-enabled/orianblog.conf /etc/nginx/sites-available/orianblog.conf; nginx -t && systemctl reload nginx; rm -rf /var/www/257823.xyz/html; certbot delete --cert-name 257823.xyz'
```

如果 `certbot delete` 提示证书名不匹配，先运行 `sudo certbot certificates`，确认实际证书名称后再删。

如果你后面还要在同一台 VPS 上部署新域名，只需要保留 `git`、`nginx`、`nodejs`、`npm`、`certbot`，把脚本里的 `DOMAIN`、`WWW_DOMAIN`、`BASE_URL` 改成新值，再重新部署即可。

## 数据说明

- 浏览量、点赞、收藏：存储在浏览器 `localStorage`
- 评论：当前为本地评论，不依赖登录态
- `robots.txt` 和 `sitemap.xml`：由 `tools/site.mjs` 自动生成
