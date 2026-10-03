# NexAI 创新工坊线下沙龙

面向线下沙龙的课程网站，使用 React + Vite 构建，中英双语，包含概念图谱（Three.js 实时渲染）与工具实操图解。

## 页面结构

站点由六个独立页面组成，通过普通链接跳转：

| 文件 | 页面 | 说明 |
| --- | --- | --- |
| `index.html` | 首页 / Home | 沙龙主视觉与整体介绍 |
| `downloads.html` | 软件下载 / Downloads | 课堂所需软件与获取方式 |
| `speaker.html` | 讲师介绍 / Speaker | 讲师背景与研究方向 |
| `concepts.html` | 概念图谱 / Concept Maps | Three.js 实时渲染的专业名词关系图 |
| `workflows.html` | 工作流 / Workflows | 论文、PPT、视频、办公与比赛四套图解 |
| `tools.html` | 工具实操 / Hands-on Tools | 软件截图演示，点击可放大 |

## 技术栈

- React + Vite（多页面构建，`base: './'` 相对路径）
- Three.js：在首页与概念图谱页面异步加载，支持拖拽旋转、节点点选及关联动画
- 纯静态输出，无后端依赖，所有图片资源随构建产物一并打包

## 本地开发

```bash
npm install      # 安装依赖
npm run dev      # 本地开发预览
npm run build    # 构建，产物输出到 dist/
npm run preview  # 预览构建结果
```

## 部署方式

**方式一：直接使用构建产物**

将 `dist` 目录整体上传为网站根目录。注意不能只上传 `index.html`，六个页面相互引用，需保持目录结构完整。

**方式二：GitHub Pages**

根目录 `index.html` 是 Vite 入口模板，不能直接将源码根目录作为静态网站发布。使用 GitHub Pages 时，应配置构建流程发布完整的 `dist` 内容。本仓库上传包含源码及构建产物，未自动启用 Pages。

## 课堂使用建议

- 报告厅建议使用最新版 Chrome 或 Edge，浏览器缩放保持 100%
- 「概念图谱」页面可拖拽旋转 3D 视角；点击专业名词或图内节点，会高亮相关连线、播放光点动画并显示双语解释
- 「工作流」页面可切换不同场景的图解
- 「工具实操」页面点击截图放大，按 Esc 关闭
- 已适配平板与手机，并支持系统「减少动态效果」设置

## 目录结构

```
├── index.html / *.html      # Vite 多页面入口模板
├── src/                     # React 源代码
├── public/                  # 静态资源（图片等）
├── assets/                  # 素材源文件
├── dist/                    # 构建产物（部署用）
└── design-concepts/         # 设计稿
```

详细部署说明见 `WORKBUDDY部署说明.md`。
