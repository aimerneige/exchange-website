# 交换小站 · Exchange

适合演唱会、快闪店和联动活动现场使用的免费周边交换展示工具。基于 React、TypeScript、Vite 和 mdui 2，遵循 Material Design 3 的配色、组件、形状和交互方式。

本站与 LoveLive! 官方无关，不提供线上交易市场或支付功能。

## 开发与构建

需要 Node.js 22.12+（建议 Node.js 22 LTS）和 npm。

```sh
npm ci
npm run dev
npm run build
npm run preview
```

`npm run build` 同时执行 TypeScript 检查，输出完整静态站点至 `dist/`。PWA 缓存在生产构建中启用，开发服务器不注册 Service Worker。

## 功能

- HAVE / WANT 分栏，中日英三语现场提示；手机上下排列，桌面和平板左右排列。
- 添加、编辑、删除商品；上传实物图片，或选择 μ’s / Aqours 的 18 个默认角色。
- 数量管理、每次交换递减一件、自动或手动标记已交换、恢复、隐藏已交换。
- 上移 / 下移排序、团体筛选、大图预览、展示模式与可用浏览器中的全屏。
- 亮色 / 暗色主题，本机记住选择。
- IndexedDB 保存商品与压缩图片；刷新后恢复。保存失败不会更新已保存列表。
- PWA 应用壳与全部默认角色图片缓存；联网完成缓存后，可离线查看、添加、编辑和标记商品。

首次打开显示明确标记的示例预览。添加首件商品后会自动替换示例，也可点「开始我的交换板」创建空白列表。示例不会自动保存为用户拥有的商品。

## 部署到 GitHub Pages

自行将 **`dist/` 中的所有内容（包括隐藏的 `.nojekyll`）** 发布到 Pages 使用的目录或分支。无需服务器、环境变量或后端，本项目没有 GitHub Actions / CI。`dist/` 是构建产物，不提交到源码 Git。

`public/CNAME` 已配置为 `exchange.lovelive.moe`，Vite 会原样复制到 `dist/CNAME`。在 GitHub Pages 设置中配置自定义域名和 HTTPS，并按 [GitHub 官方说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)设置 DNS。使用 Cloudflare 代理时，源站 HTTPS 启用后使用 **Full (strict)** TLS 模式。

资源使用相对路径 `base: './'`，在自定义域名根目录和仓库子目录均可工作。页面不使用 History 路由，不需要服务器重写。如果改用 `username.github.io/repository/`，请删除或修改 CNAME，避免继续指向当前自定义域名。

Service Worker 需要 HTTPS，localhost 可用于测试。更新部署后，关闭此站点的所有窗口再重新打开，可让等待中的新版 Service Worker 生效。Cloudflare 自定义缓存规则不要长期缓存 `index.html`、`sw.js` 和 `manifest.webmanifest`；带哈希的 `assets/` 可使用长期缓存。若启用了「缓存所有内容」，更新部署时也需清理这些入口缓存；替换同名默认图片时，还需清理对应 `characters/` 路径的 CDN 缓存。

## 免费托管的适用范围

截至 2026-10-01 核对的官方规则：

- [GitHub Pages 限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)：发布站点最大 1 GB，每月流量软上限 100 GB；不允许用作以商业交易为主要目的的网站或商业 SaaS，不应处理密码、银行卡等敏感交易。
- [Cloudflare CDN 的 Free / Pro / Business 条款](https://www.cloudflare.com/service-specific-terms-application-services/)：CDN 用于网页和网站；视频、大文件，或不成比例的图片、音频等内容分发可能被限制，需要采用适用的专用服务。条款没有为普通免费 CDN 规定一个可据此保证合规的固定图片流量比例。

本项目是免费的、非商业的本机展示工具。上传图片在浏览器内缩放至最长边 1200 px 并转为 WebP，保存在 IndexedDB，不会上传到 GitHub Pages、Cloudflare 或任何后端。18 张默认角色图保存在 `public/characters/`，合计约 500 KiB，随 `dist/` 一起部署，由本站提供。站点分发 HTML、CSS、JavaScript、小型 PWA 资源及这些页面配图，不依赖 Workers、R2 或付费功能，不提供图片托管或批量文件分发。字体和图标无需外部 CDN。

这些实现降低托管资源占用，但不能保证未来条款、实际流量或第三方素材使用始终符合要求。部署者仍需遵守平台条款、监控真实流量，并确保图片使用具有相应权限。

## 默认角色与扩展

编辑 `src/data/characters.ts` 中的 `characterGroups`，添加团体 / IP 和角色：

```ts
{
  id: 'bocchi',
  franchise: 'ぼっち・ざ・ろっく！',
  name: '結束バンド',
  characters: [
    { id: 'hitori', name: '後藤ひとり', image: './characters/bocchi/hitori.png', color: '#dc92b8' },
  ],
}
```

将新增图片放入对应的 `public/characters/` 目录，使用以 `./characters/` 开头的相对地址。重新构建后，编辑器、团体筛选和 Service Worker 的预缓存图片清单会自动读取此配置。图片内容变化也会更新离线缓存版本；缺少配置中的文件会导致构建失败，避免发布不完整资源。无需改变页面组件。默认角色名称允许修改，用户也可上传其他 IP 的照片并自行填写名称。

默认角色图从用户提供的 `muse.zip` 与 `aqours.zip` 提取，保留原始 PNG、尺寸与文件名，排除 `__MACOSX` 元数据。文件路径为 `public/characters/muse/member01.png` 至 `member09.png`，以及 `public/characters/aqours/thumb01.png` 至 `thumb09.png`，按用户提供的顺序对应角色。

图片原始来源为 LoveLive! 官方网站的 `otonokizaka/member/member_top.hyperesources/` 与 `uranohoshi/img/member/` 路径。角色图只表示角色，不代表具体商品。版权归各自权利人所有，非官方声明不等于素材授权。页面加载默认图时只请求本站资源；旧交换板保存的已知官方图片地址会在显示时自动映射至本地图片，保留商品与上传照片。

## 数据与隐私

没有账号、服务器数据库、分析脚本或多设备同步。浏览器、GitHub Pages 和 Cloudflare 仍可能按其自身政策处理网络请求。商品和上传图片不会发送到服务器。

交换板仅属于当前浏览器、当前站点源。清除网站数据、隐私模式关闭、浏览器存储回收或换设备可能丢失数据；更换域名也不会自动迁移本地数据。此 MVP 没有备份与导入导出功能。

默认角色图片随应用壳一次性预缓存，完成后首次离线打开编辑器也可查看两个团体的全部角色。离线使用依赖缓存成功安装及可用的浏览器存储；请首次保持联网，直到页面显示「已支持离线使用」。新版 Service Worker 激活时会清理旧版应用壳与旧外链图片缓存。

## 浏览器验证

```sh
npx playwright install chromium
npm run build
npm test
```

测试直接运行生产 `dist/`，覆盖增删改、排序、数量和状态、刷新持久化、上传图片缩放、断网重载和编辑、全部默认图片离线显示、旧外链兼容、存储失败、展示模式、主题、链接，以及 320 / 390 / 768 / 1024 / 1440 px 布局。截图和 trace 输出至被 Git 忽略的 `test-results/`。

全屏、PWA 安装和存储保留受浏览器限制；iOS 上可通过 Safari「添加到主屏幕」使用。当前自动化测试使用 Chromium，其他浏览器仍需部署者按现场设备验证。
