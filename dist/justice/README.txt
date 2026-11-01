NexAI 政法版 · 《与AI共事——监所工作的人工智能新实践》游戏化园区课件

【部署】已集成在 AIshalong 仓库 dist/justice/，随镜像发布，访问地址：
  https://salon.tokenone.work/justice/
（二维码 assets/qr.png 指向这个地址；目录名改了需重新生成。）

【玩法】
  · 开始界面点"进入园区"，镜头从高空飞入一座 three.js 搭建的虚构训练园区。
  · 园区里 8 个车间对应 8 段课程：报到大厅、AI 认知馆、保密红线室、文书谈话工坊、
    休息花园、智能体工厂、短视频演播厅、指挥调度中心。
  · 点击车间（或左侧任务列表、底部时间线、车间上方标签）→ 镜头飞过去、屋顶掀开看内部
    → 浮窗里点"进入课件"，右侧滑出该讲的完整课件。
  · 顶栏：俯视（回总览）、巡视（自动轮巡各车间）、夜间/白天、扫码、全屏。
  · 键盘：← → 切换车间 / 课件，Enter 打开课件，Esc 返回，F 全屏。
  · 鼠标拖动旋转园区，滚轮缩放；手机单指旋转、双指缩放。
  · 顶栏时钟按北京时间走，左侧任务按讲课时段自动标"进行中"，打开过的课件标"已完成"。

【文件】
  index.html / style.css   页面与样式（HUD 大屏 + 课件）
  game.js                  园区三维场景与 HUD 交互
  app.js / scenes.js       各讲课件内的交互与三维配图
  vendor/three.min.js      three.js 本地文件；fonts/ 本地字体
  assets/cartoon/          卡通封面图与案例示意图
  assets/cases/            （可选）真实案例原报道配图 case1-6.jpg，见下
  assets/demo.mp4          （可选）短视频成片

【真实案例配图】把原报道配图存为 assets/cases/case1.jpg … case6.jpg 即自动替换示意图：
  1 司法部"智慧监狱"推进会  https://cn.chinadaily.com.cn/a/201901/14/WS5c3c3d4ea31010568bdc3514.html
  2 上海青东戒毒所 VR 评估  https://www.xinhuanet.com/politics/2018-06/22/c_1123021110.htm
  3 浙江 VR 戒毒千人测试    https://www.thepaper.cn/newsDetail_forward_1756098
  4/5 湛江·沾化司法局、静海检察院  https://news.ifeng.com/c/8h7Lw9YsarC
  6 英国司法部 AI 预测监狱暴力  https://governmenttechnology.co.uk/node/8893
  新闻照片有版权，请确认可用后再放。

【说明】园区为虚构训练场景，不对应任何真实监所布局。所有资源均在本地，断网可用。
  三维园区需要显卡渲染，上台前请在投影电脑上先打开试一遍。
