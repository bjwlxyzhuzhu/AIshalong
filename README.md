# NexAI 三版本统一入口

## 目录

- `dist/index.html`：暖橙秋日、视频与 Three.js 小狐狸统一入口。
- `dist/education/index.html`：《SI时代下教师教研思维与应用》，保留课程内容、首页结构与交互动效，统一采用暖白学术编辑风。
- `dist/education/reading-theme.css`：教育版暖白、深墨与朱砂配色；首页以深色动效舞台与暖白阅读区域交错。
- `dist/enterprise/`：原 AIshalong 站点的完整构建文件，内容未改动。
- `dist/portal-assets/`：入口的本地视频、静态回退图、GLB 模型、Three.js r160 与相关加载器。

政务版仅为禁用状态，无链接、无占位课程。未来开发完成后，可添加 `dist/government/index.html` 并更改入口。

## 部署

将 **dist 内全部内容** 上传到网站根目录，保留 `education`、`enterprise`、`portal-assets` 的相对目录结构。无需 Node.js 构建、无需数据库、无需填写 API 密钥。也适合部署在 GitHub Pages 的仓库子路径下。

请使用 HTTP 静态服务器预览，直接双击 `index.html` 时浏览器可能阻止 ES Module 和 GLB 加载；两个版本链接仍保留。可以在本目录运行 `python -m http.server 8789 --directory dist`，然后访问 `http://127.0.0.1:8789/`。

本次新建独立入口项目，未覆盖本地原 AIshalong 源码与原部署包。按用户后续授权同步至 `bjwlxyzhuzhu/AIshalong`；该仓库原 React 源码保留，当前站点以本部署包 `dist` 为准，不需要运行旧 React 项目的构建命令。`enterprise` 是此次制作时原站 `dist` 的本地快照，后续更新原站后需重新同步。

## Docker 镜像与 GitHub Actions

仓库 `main` 分支推送后，原有 `.github/workflows/docker-image.yml` 自动构建并发布 Nginx 静态网站镜像，工作流不做修改。Docker 构建会检查首页、两个版本和二维码文件存在，并执行 `nginx -t` 校验配置，然后发布至 GHCR：

`ghcr.io/bjwlxyzhuzhu/aishalong:latest`

同时沿用 `sha-<短提交SHA>` 与版本标签规则。Actions 使用自动提供的 `GITHUB_TOKEN`，不需要将个人访问令牌保存为仓库 Secret。工作流也支持在 Actions 页面手动运行。

```sh
docker pull ghcr.io/bjwlxyzhuzhu/aishalong:latest
docker run -d --name nexai-salon --restart unless-stopped -p 8080:80 ghcr.io/bjwlxyzhuzhu/aishalong:latest
```

访问服务器的 8080 端口即可看到统一入口。正式域名 `salon.tokenone.work` 的 DNS、HTTPS 证书及反向代理由部署方配置，本工作流不会修改 DNS 或自动部署到服务器。新建 GHCR 包默认可能为私有；如拉取时提示无权限，需使用有 `read:packages` 权限的账号登录 GHCR，或由仓库管理员按实际共享需求调整包的可见性。

远程仓库原有 `docker-compose.portainer.yml`、`docker/nginx.conf` 和 React 源码保持保留。Portainer 仍可沿用原 Stack：服务 `aishalong`、`8080:80`、宿主机 `/opt/salon` 挂载到容器 `/data`。本项目是纯静态网站，不会向该目录写入数据。新镜像直接打包已验证的 `dist`，不会执行旧 React 源码的构建命令而覆盖统一入口。

## 交互与适配

- 教育版、企业版支持快捷导航、底部入口和展开菜单三种进入方式。
- 政务版为原生 disabled 按钮，不可点击或通过键盘访问。
- 展开菜单支持遮罩关闭、Escape 关闭及键盘焦点循环。
- 首页提供 `https://salon.tokenone.work` 的真实二维码，已做解码核验；域名解析与正式服务器绑定仍需由部署方完成。本次不会改变 DNS。
- 暂停按钮同时控制视频与 3D 浮动；尊重系统减少动态效果设置，页面隐藏时暂停。
- 视频未就绪时显示静态回退图；WebGL 不可用或模型失败不影响课程入口。
- 首屏采用单个 HTML 内联 CSS/JS，重型媒体和 Three.js 随包本地化，避免依赖第三方 CDN。

## 素材来源

背景视频、静态图与小狐狸模型取自用户提供的设计提示词中三个 CloudFront URL；本项目未自行验证其商业再分发授权，公开商业使用前应确认素材权利。

Three.js 来自 jsDelivr 官方 npm `three@0.160.0` 分发，许可证随 `dist/portal-assets/vendor/LICENSE` 提供。两套课程内原有第三方链接、素材和网络服务依赖保持不变。

Questrial 与 Urbanist 字体来自 Google Fonts，字体及 OFL 许可证已随包本地化。
