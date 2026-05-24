# Orian's Blog

一个基于 `HTML + CSS + JavaScript` 的静态个人博客，重点放在简洁的阅读体验、轻量交互和低维护成本。

## 主要功能

- 首页、文章列表页、文章详情页
- 主题切换、语言切换
- 文章搜索、排序、最近文章展示
- 文章详情页目录、阅读进度、上一页/下一页、点赞、收藏、复制链接
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
- `js/articles-home.js`：首页与归档页渲染、搜索、排序
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

- `build`：检查核心脚本语法，并生成 `robots.txt`、`sitemap.xml`
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
   - 如果你还在用 GitHub Pages，推送后会自动部署。
   - 如果你已经切到 Debian VPS，服务器会按定时任务自动拉取并刷新站点。

## 通过 Cloudflare 托管域名

这里的“通过 CF 托管域名”指的是把域名的 DNS 管理交给 Cloudflare，而不是把站点改成 Cloudflare Pages。

### 1. 把域名接入 Cloudflare

1. 在 Cloudflare 添加你的域名。
2. 到域名注册商那里，把 NS 记录改成 Cloudflare 提供的两条名称服务器。
3. 等域名状态变成 `Active`，再继续下一步。

### 2. 配置 DNS 记录

如果你继续使用这套 `Debian VPS + Nginx` 发布方式，建议这样配：

- `A` 记录：`@` 指向你的 VPS 公网 IP
- `CNAME` 记录：`www` 指向 `@`，或者直接给 `www` 配一条 `A` 记录

建议先把记录设为 `DNS only`，等 HTTPS 证书正常签发后，再按需开启 Cloudflare 代理。

### 3. 配置 SSL/TLS

- Cloudflare 面板里把 `SSL/TLS` 模式设为 `Full` 或 `Full (strict)`
- 如果你使用本仓库自带的 VPS 脚本签发证书，首次部署时先保证 `A` 记录已经生效
- 如果证书签发失败，优先检查：
  - 域名是否已经正确解析到 VPS
  - Cloudflare 代理是否影响了 HTTP 验证
  - Nginx 是否可以直接访问站点根目录

### 4. 对应到本仓库的部署脚本

当前仓库的 VPS 脚本默认仍是直接发布到服务器文件系统，并由 Nginx 提供服务。
如果你把域名切到 Cloudflare，只需要保证：

- `deploy/debian/bootstrap.sh` 里的 `DOMAIN`、`WWW_DOMAIN`、`BASE_URL` 改成你的真实域名
- `tools/site.mjs` 生成的站内链接和站点地址与新域名一致

如果你要改成 Cloudflare Pages 托管站点本体，需要另外补一套 Pages 构建和发布流程，当前仓库还没有配置这部分。

## Debian VPS 部署

如果你要把站点部署到 `257823.xyz` 和一台 Debian VPS，上线流程可以尽量自动化。

前提只需要一项：

- 把 `257823.xyz` 和 `www.257823.xyz` 的 `A` 记录指向你的 VPS IP

然后在 VPS 上直接执行这条命令：

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

如果你想立刻手动触发一次同步，只需运行：

```bash
sudo systemctl start orianblog-sync.service
```

如果证书签发失败，通常是域名解析还没生效。等 `A` 记录生效后，再执行一次上面的同步命令即可。

## 数据说明

- 浏览量、点赞、收藏：存储在浏览器 `localStorage`
- 评论：当前为本地评论，不依赖登录态
- `robots.txt` 和 `sitemap.xml`：由 `tools/site.mjs` 自动生成
