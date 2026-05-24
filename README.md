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

## 域名网站管理界面如何配置

如果你已经有自己的域名，需要在域名注册商或 DNS 管理后台里做下面这些操作。这里的目标不是把站点改成别的平台，而是把域名解析到当前 VPS。

### 1. 进入域名的 DNS 管理页面

登录域名注册商后台，找到类似下面的入口：

- 域名管理
- DNS 管理
- 解析设置
- 自定义解析

### 2. 添加解析记录

建议至少配置两条记录：

- `A` 记录：主机记录填 `@`，记录值填你的 VPS 公网 IP
- `CNAME` 记录：主机记录填 `www`，指向 `@`

如果你的注册商不支持把 `www` 指向 `@`，也可以直接给 `www` 再加一条 `A` 记录，值同样填写 VPS 公网 IP。

### 3. 先关闭代理，再等证书签发

如果你使用的是 Cloudflare 或类似带代理的 DNS 服务，建议先把解析状态设成 `DNS only`，不要先开代理：

- 原因是首次签发 HTTPS 证书时，服务器需要直接验证域名是否能解析到 VPS
- 等证书签发成功、站点能正常访问后，再按需开启代理

### 4. SSL/TLS 设置

如果你使用 Cloudflare 托管 DNS：

- `SSL/TLS` 模式设为 `Full` 或 `Full (strict)`
- 如果 VPS 上已经成功签发了证书，优先使用 `Full (strict)`

如果你只是使用普通注册商 DNS，不需要额外配置 Cloudflare 的 SSL 模式，直接让 VPS 上的 `certbot` 签发证书即可。

### 5. 域名切换时要同步修改源码

如果你把站点从默认域名切换到自己的域名，需要同时修改这两个位置：

- `deploy/debian/bootstrap.sh` 里的 `DOMAIN`、`WWW_DOMAIN`、`BASE_URL`
- `tools/site.mjs` 生成的站内链接和站点地址

改完后重新执行构建和部署脚本，确保站内链接、`robots.txt`、`sitemap.xml` 都使用新域名。

### 6. 如何删除旧配置

如果你后面不再使用某个旧域名，建议按这个顺序清理：

1. 先在 DNS 管理后台删除旧域名对应的 `A` 记录和 `CNAME` 记录。
2. 如果使用了 Cloudflare，再把旧域名从 Cloudflare 中移除，或至少取消代理和解析记录。
3. 在 VPS 的部署脚本里把 `DOMAIN`、`WWW_DOMAIN`、`BASE_URL` 改成新的值，避免同步脚本继续生成旧链接。
4. 如果旧域名已经不再需要，也可以顺手删除服务器上旧站点配置和证书，但这一步要确认新域名已经正常可用后再做。

### VPS 里怎么删

如果你要把这套站点从 VPS 上彻底删除，建议按下面顺序执行，先停同步，再删站点文件和证书，最后清理 Nginx 配置。

```bash
sudo systemctl stop orianblog-sync.timer
sudo systemctl stop orianblog-sync.service
sudo systemctl disable orianblog-sync.timer
sudo rm -f /etc/systemd/system/orianblog-sync.service
sudo rm -f /etc/systemd/system/orianblog-sync.timer
sudo systemctl daemon-reload
sudo rm -f /etc/nginx/sites-enabled/orianblog.conf
sudo rm -f /etc/nginx/sites-available/orianblog.conf
sudo nginx -t
sudo systemctl reload nginx
sudo rm -rf /var/www/257823.xyz/html
sudo certbot delete --cert-name 257823.xyz
```

如果 `certbot delete` 提示证书名不匹配，先运行 `sudo certbot certificates`，确认实际证书名称后再删。

如果你后面还要在同一台 VPS 上部署新域名，只需要保留 `git`、`nginx`、`nodejs`、`npm`、`certbot`，把脚本里的 `DOMAIN`、`WWW_DOMAIN`、`BASE_URL` 改成新值，再重新部署即可。

## 通过 Cloudflare 托管域名

这里的“通过 Cloudflare 托管域名”指的是把域名的 DNS 交给 Cloudflare 管理，而不是把站点迁到 Cloudflare Pages。

### 1. 把域名接入 Cloudflare

1. 在 Cloudflare 添加你的域名。
2. 到域名注册商后台，把 NS 记录改成 Cloudflare 提供的两条名称服务器。
3. 等域名状态变成 `Active` 后，再继续下一步。

### 2. 在 Cloudflare 里配置解析

如果你继续使用当前仓库提供的 `Debian VPS + Nginx` 部署方式，建议这样配：

- `A` 记录：`@` 指向 VPS 公网 IP
- `CNAME` 记录：`www` 指向 `@`

建议先把记录设为 `DNS only`，等 HTTPS 证书正常签发后，再按需要开启 Cloudflare 代理。

### 3. 配置 SSL/TLS

- Cloudflare 面板里把 `SSL/TLS` 模式设为 `Full` 或 `Full (strict)`
- 如果你使用仓库自带的 VPS 脚本签发证书，先确保 `A` 记录已经生效
- 如果证书签发失败，优先检查：
  - 域名是否已经正确解析到 VPS
  - Cloudflare 代理是否影响了 HTTP 验证
  - Nginx 是否可以直接访问站点根目录

## Debian VPS 部署

如果你要把站点部署到 `257823.xyz` 和一台 Debian VPS，上线流程尽量自动化。

前提只需要一项：

- 把 `257823.xyz` 和 `www.257823.xyz` 的 `A` 记录指向 VPS IP

然后在 VPS 上直接执行：

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

如果你想立刻手动触发一次同步，只需要运行：

```bash
sudo systemctl start orianblog-sync.service
```

如果证书签发失败，通常是域名解析还没有生效。等 `A` 记录生效后，再执行一次上面的同步命令即可。

## 数据说明

- 浏览量、点赞、收藏：存储在浏览器 `localStorage`
- 评论：当前为本地评论，不依赖登录态
- `robots.txt` 和 `sitemap.xml`：由 `tools/site.mjs` 自动生成
