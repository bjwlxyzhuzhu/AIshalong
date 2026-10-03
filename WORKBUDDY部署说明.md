# NexAI 创新工坊线下沙龙（江苏大学站）部署说明

## 最简单的部署方式

请将压缩包中的 `dist` 文件夹作为网站根目录整体上传，不要只上传 `index.html`。

`dist` 中已经包含六个独立页面：

- `index.html`：首页 / Home
- `downloads.html`：软件下载 / Downloads
- `speaker.html`：讲师介绍 / Speaker
- `concepts.html`：概念图谱 / Concept Maps
- `workflows.html`：工作流 / Workflows
- `tools.html`：工具实操 / Hands-on Tools

## 技术说明

- 网站使用 React 构建，多页面之间使用普通链接跳转。
- 专业名词关系图、TokenOne＋API＋智能体调用图使用 Three.js 实时渲染。
- 所有界面截图已经随 `dist` 打包，部署后不依赖本地文件。
- Three.js 在进入“概念图谱”页面时异步加载，其他页面不会提前加载 3D 模块。
- 支持桌面投影、平板和手机，支持“减少动态效果”系统设置。

## 二次开发

如需修改源代码：

1. 安装 Node.js。
2. 在项目目录执行 `npm install`。
3. 执行 `npm run dev` 本地预览。
4. 修改完成后执行 `npm run build`，重新部署 `dist` 文件夹。

## 课堂使用建议

- 报告厅建议使用最新版 Chrome 或 Edge，浏览器缩放保持 100%。
- “概念图谱”页面可用鼠标改变 3D 视角并聚焦节点。
- “工作流”页面可切换论文、PPT、视频、办公与比赛四套图解。
- “工具实操”页面点击软件截图可放大，按 Esc 关闭。
