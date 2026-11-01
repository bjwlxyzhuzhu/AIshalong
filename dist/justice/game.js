/* NexAI 政法版 · 游戏化园区（three.js） */
(function(){
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
document.documentElement.classList.add("game");
const toast=t=>window.__toast?window.__toast(t):0;
const store=window.__store||{get:(k,d)=>d,set(){}};
const REDUCE=matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE=matchMedia("(max-width:900px)").matches;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pad=n=>String(n).padStart(2,"0");

/* ---------------- 模块（车间）定义 ---------------- */
const MODS=[
 {id:"open",no:"01",name:"报到大厅",sub:"开篇",time:"08:30",end:"08:45",secs:["open"],c:"#58d7ff",pos:[-17,-13],type:"hall",agent:"迎新助手",
  desc:"新警的一天：AI 能帮什么、不能碰什么；先认识千问录音和 WorkBuddy 两件趁手工具。",tasks:["一天时间线","现场投票","千问录音纪要","WorkBuddy 办公"]},
 {id:"s1",no:"02",name:"AI 认知馆",sub:"第一讲",time:"08:45",end:"09:10",secs:["s1"],c:"#4d9bff",pos:[0,-13],type:"theater",agent:"认知讲解员",
  desc:"大模型怎么“想”、现在能做到什么、会在哪里出错，外加 6 个政法系统真实案例。",tasks:["猜下一个词","揭穿幻觉","能力全景","提示词公式","真实案例"]},
 {id:"s2",no:"03",name:"保密红线室",sub:"第二讲",time:"09:10",end:"09:25",secs:["s2"],c:"#ff5d6c",pos:[17,-13],type:"vault",agent:"保密守门员",
  desc:"三不传、内外网物理隔离、一键脱敏、四个必须，最后做情景判断自测。",tasks:["三不传","内外网隔离","脱敏演示","情景自测"]},
 {id:"s3",no:"04",name:"文书谈话工坊",sub:"第三讲",time:"09:25",end:"10:00",secs:["s3"],c:"#ffa24d",pos:[-17,13],type:"office",agent:"谈话陪练员",
  desc:"5 个文书提示词模板一键复制；AI 扮演沉默型、对抗型、试探型谈话对象陪你练。",tasks:["模板库","谈话陪练","教育微课"]},
 {id:"rest",no:"05",name:"休息花园",sub:"中场休息",time:"10:00",end:"10:20",secs:["rest"],c:"#4dff9a",pos:[-36,0],type:"garden",agent:"休息提醒",
  desc:"中场休息 20 分钟：倒计时、AI 冷知识轮播，顺手把红线自测做完。",tasks:["20 分钟倒计时","AI 冷知识"]},
 {id:"s4",no:"06",name:"智能体工厂",sub:"第四讲",time:"10:20",end:"10:55",secs:["s4"],c:"#2fe0c8",pos:[0,13],type:"factory",agent:"智能体工程师",
  desc:"智能体的五个部件、7 个监所场景智能体，用 Claude / Codex 现场开发法规问答助手。",tasks:["智能体组装","场景矩阵","现场开发","部署边界"]},
 {id:"s5",no:"07",name:"短视频演播厅",sub:"第五讲",time:"10:55",end:"11:20",secs:["s5"],c:"#c18bff",pos:[17,13],type:"studio",agent:"短视频编剧",
  desc:"六步工作流做一条 60 秒普法短视频：选题、分镜、画面、配音、剪辑、审核。",tasks:["六步流水线","分镜胶片","成片展示","宣传红线"]},
 {id:"end",no:"08",name:"指挥调度中心",sub:"结语",time:"11:20",end:"11:30",secs:["end","oathSec","finalSec"],c:"#f6f03b",pos:[0,0],type:"dome",agent:"调度总控",
  desc:"AI 发现、民警判断、制度兜底——人在回路；八条新警 AI 守则，扫码收藏。",tasks:["人在回路","八条守则","扫码收藏"]}
];
const IDX={};MODS.forEach((m,i)=>{IDX[m.id]=i;m.secs.forEach(s=>IDX[s]=i)});
const toMin=s=>{const [h,m]=s.split(":").map(Number);return h*60+m};
MODS.forEach(m=>{m.t0=toMin(m.time);m.t1=toMin(m.end)});
let visited=store.get("visited",{});

/* ---------------- 北京时间 ---------------- */
function bj(){const s=new Date().toLocaleString("en-US",{timeZone:"Asia/Shanghai",hour12:false});const d=new Date(s);return d}
function nowMod(){const d=bj(),m=d.getHours()*60+d.getMinutes();return MODS.findIndex(x=>m>=x.t0&&m<x.t1)}

/* ================================================================
   three.js 园区
   ================================================================ */
const T=THREE;
const canvas=$("#parkCanvas");
let R;
try{R=new T.WebGLRenderer({canvas,antialias:true})}catch(e){document.body.classList.add("no3d")}
const scene=new T.Scene();
const cam=new T.PerspectiveCamera(32,1,1,600);
const anims=[];
const clickables=[];
const buildings=[];
if(R){
R.setPixelRatio(Math.min(MOBILE?1.5:1.75,window.devicePixelRatio||1));
R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
}

/* 卡通材质 */
const gm=new T.DataTexture(new Uint8Array([110,110,110,255,190,190,190,255,255,255,255,255]),3,1);gm.minFilter=gm.magFilter=T.NearestFilter;gm.needsUpdate=true;
const MAT={};const mat=(c,o={})=>{const k=c+JSON.stringify(o);if(!MAT[k])MAT[k]=new T.MeshToonMaterial(Object.assign({color:c,gradientMap:gm},o));return MAT[k]};
const OUTL=new T.MeshBasicMaterial({color:0x14201a,side:T.BackSide});
function mesh(geo,c,parent,{p=[0,0,0],r=[0,0,0],s=null,sh=true,ol=0,m=null}={}){
  const g=new T.Mesh(geo,m||mat(c));g.position.set(...p);g.rotation.set(...r);if(s)g.scale.set(...s);
  g.castShadow=sh;g.receiveShadow=true;parent.add(g);
  if(ol){const o=new T.Mesh(geo,OUTL);o.scale.setScalar(1+ol);g.add(o)}
  return g}
function canvasTex(lines,{w=512,h=128,bg="#0c1712",fg="#4dff9a",size=56,align="center",border=null}={}){
  const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");
  g.fillStyle=bg;g.fillRect(0,0,w,h);if(border){g.strokeStyle=border;g.lineWidth=8;g.strokeRect(4,4,w-8,h-8)}
  const L=[].concat(lines);g.textAlign=align;g.textBaseline="middle";
  L.forEach((t,i)=>{const sz=i?size*.55:size;g.font=`800 ${sz}px "PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif`;g.fillStyle=i?"#cfe9da":fg;g.fillText(t,align==="center"?w/2:24,h/(L.length+1)*(i+1)+(L.length>1?(i?6:-4):4))});
  const t=new T.CanvasTexture(c);t.anisotropy=4;return t}
function screen(parent,tex,w,h,p,r=[0,0,0]){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,toneMapped:false}));m.position.set(...p);m.rotation.set(...r);parent.add(m);return m}

/* ---------- 光照 / 天空 ---------- */
const DAY={bg:new T.Color(0x6fb6e0),fog:new T.Color(0x6fb6e0),hemi:.62,sun:.95,amb:.12};
const NIGHT={bg:new T.Color(0x07101c),fog:new T.Color(0x07101c),hemi:.22,sun:.18,amb:.08};
scene.background=DAY.bg.clone();scene.fog=new T.Fog(DAY.fog.clone(),110,240);
const hemi=new T.HemisphereLight(0xe8f6ff,0x4b6b3a,DAY.hemi);scene.add(hemi);
const amb=new T.AmbientLight(0xffffff,DAY.amb);scene.add(amb);
const sun=new T.DirectionalLight(0xfff2d8,DAY.sun);sun.position.set(-40,70,35);sun.castShadow=true;
sun.shadow.mapSize.set(MOBILE?1024:2048,MOBILE?1024:2048);const sc=sun.shadow.camera;sc.left=-60;sc.right=60;sc.top=50;sc.bottom=-50;sc.near=10;sc.far=200;sun.shadow.bias=-.0006;scene.add(sun);
let night=0,nightT=0;
const glowMats=[];// 夜间发光材质
const glow=(c,base=.12)=>{const m=new T.MeshToonMaterial({color:c,gradientMap:gm,emissive:new T.Color(c),emissiveIntensity:base});m.userData.base=base;glowMats.push(m);return m};

/* ---------- 地面、道路 ---------- */
const ground=mesh(new T.PlaneGeometry(400,400),0x5fb54e,scene,{r:[-Math.PI/2,0,0],sh:false});
mesh(new T.PlaneGeometry(92,64),0x72c45e,scene,{p:[0,.01,0],r:[-Math.PI/2,0,0],sh:false});
const roadM=mat(0x4c5563),lineM=new T.MeshBasicMaterial({color:0xf5f1d6});
function road(x,z,w,l,rot=0){const g=new T.Group();g.position.set(x,.03,z);g.rotation.y=rot;scene.add(g);
  mesh(new T.PlaneGeometry(w,l),0,g,{r:[-Math.PI/2,0,0],sh:false,m:roadM});
  mesh(new T.PlaneGeometry(w+.6,l),0xd7d2c4,g,{p:[0,-.01,0],r:[-Math.PI/2,0,0],sh:false});
  for(let k=-l/2+1.5;k<l/2-1;k+=3.2)mesh(new T.PlaneGeometry(.18,1.6),0,g,{p:[0,.01,k],r:[-Math.PI/2,0,0],sh:false,m:lineM});return g}
road(0,0,4.4,84,Math.PI/2);// 主干道
[-8.6,8.6].forEach(x=>{road(x,-14,3.4,24);road(x,14,3.4,24)});
road(0,-27.5,3.4,62,Math.PI/2);road(0,27.5,3.4,62,Math.PI/2);road(-29.5,0,3.4,58);road(29.5,0,3.4,58);
// 中心广场
mesh(new T.CircleGeometry(8,48),0xe9e2cf,scene,{p:[0,.05,0],r:[-Math.PI/2,0,0],sh:false});
mesh(new T.RingGeometry(7.4,8,48),0xf6f03b,scene,{p:[0,.06,0],r:[-Math.PI/2,0,0],sh:false});

/* ---------- 树、路灯、长椅 ---------- */
const trunkG=new T.CylinderGeometry(.16,.22,1,6),crownG=new T.IcosahedronGeometry(1,0),coneG=new T.ConeGeometry(1,2.2,7);
function tree(x,z,s=1,kind=0){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(s);scene.add(g);
  mesh(trunkG,0x7a4e2d,g,{p:[0,.5,0]});
  if(kind)mesh(coneG,[0x3e9e4a,0x4bb35a,0x2f8a44][kind%3],g,{p:[0,2,0]});else mesh(crownG,[0x4bb35a,0x5cc560,0x3e9e4a][Math.floor(Math.random()*3)],g,{p:[0,1.8,0],s:[1.1,1,1.1]});
  g.userData.p=Math.random()*6;anims.push(t=>{g.rotation.z=Math.sin(t*1.2+g.userData.p)*.025});return g}
for(let x=-46;x<=46;x+=4.2){[33,-33].forEach(z=>tree(x+rnd(-1,1),z+rnd(-1.5,1.5),rnd(.9,1.35),Math.floor(rnd(0,3))))}
for(let z=-29;z<=29;z+=4.2){[50,-50].forEach(x=>tree(x+rnd(-1,1),z,rnd(.9,1.3),Math.floor(rnd(0,3))))}
[[-8.6,-1],[8.6,-1]].forEach(()=>0);
const bulbs=[];
function lamp(x,z){const g=new T.Group();g.position.set(x,0,z);scene.add(g);mesh(new T.CylinderGeometry(.07,.09,3.4,6),0x39424f,g,{p:[0,1.7,0]});
  mesh(new T.BoxGeometry(.9,.12,.3),0x39424f,g,{p:[.35,3.4,0]});const b=mesh(new T.SphereGeometry(.2,10,8),0,g,{p:[.75,3.3,0],sh:false,m:glow(0xfff2b0,.05)});bulbs.push(b);return g}
for(let x=-40;x<=40;x+=8){if(Math.abs(x)>9){lamp(x,2.9);lamp(x,-2.9)}}
function bench(x,z,ry=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);mesh(new T.BoxGeometry(1.8,.12,.5),0xb5763c,g,{p:[0,.5,0]});mesh(new T.BoxGeometry(1.8,.5,.1),0xb5763c,g,{p:[0,.8,-.22]});[-.75,.75].forEach(a=>mesh(new T.BoxGeometry(.1,.5,.45),0x39424f,g,{p:[a,.25,0]}))}

/* ---------- 人物 ---------- */
const skin=0xffd9b8;
function officer(parent,p,ry=0,s=1){const g=new T.Group();g.position.set(...p);g.rotation.y=ry;g.scale.setScalar(s);parent.add(g);
  mesh(new T.CapsuleGeometry(.28,.38,6,12),0x2c4f86,g,{p:[0,.55,0],ol:.04});
  mesh(new T.SphereGeometry(.27,16,12),skin,g,{p:[0,1.18,0],ol:.04});
  mesh(new T.CylinderGeometry(.29,.29,.12,16),0x1f3a66,g,{p:[0,1.38,0]});mesh(new T.CylinderGeometry(.24,.27,.12,16),0x2c4f86,g,{p:[0,1.47,0]});
  mesh(new T.CylinderGeometry(.21,.22,.03,16,1,false,-.9,1.8),0x111827,g,{p:[0,1.33,.08],r:[.2,0,0]});
  [-.09,.09].forEach(x=>mesh(new T.SphereGeometry(.035,8,6),0x1b2335,g,{p:[x,1.2,.25],sh:false}));
  g.userData.p=Math.random()*6;anims.push(t=>{g.position.y=p[1]+Math.abs(Math.sin(t*2.2+g.userData.p))*.04});return g}
function bot(parent,p,ry=0,s=1,col=0xf4f7fb){const g=new T.Group();g.position.set(...p);g.rotation.y=ry;g.scale.setScalar(s);parent.add(g);
  mesh(new T.CapsuleGeometry(.26,.3,6,12),col,g,{p:[0,.5,0],ol:.04});
  mesh(new T.BoxGeometry(.6,.46,.46),col,g,{p:[0,1.08,0],ol:.04});
  mesh(new T.BoxGeometry(.48,.3,.02),0x0f2340,g,{p:[0,1.08,.24],sh:false});
  [-.1,.1].forEach(x=>mesh(new T.SphereGeometry(.045,8,6),0,g,{p:[x,1.1,.255],sh:false,m:glow(0x5ff0ff,.9)}));
  mesh(new T.CylinderGeometry(.015,.015,.2,6),0x8aa0bd,g,{p:[0,1.41,0]});mesh(new T.SphereGeometry(.06,8,6),0,g,{p:[0,1.53,0],m:glow(0xf6f03b,.8)});
  g.userData.p=Math.random()*6;anims.push(t=>{g.position.y=p[1]+Math.sin(t*3+g.userData.p)*.05;g.rotation.y=ry+Math.sin(t*.8+g.userData.p)*.35});return g}
function desk(parent,p,ry=0,scr=0x4dff9a){const g=new T.Group();g.position.set(...p);g.rotation.y=ry;parent.add(g);
  mesh(new T.BoxGeometry(1.5,.08,.8),0xe8e2d4,g,{p:[0,.78,0]});[[-.68,-.32],[.68,-.32],[-.68,.32],[.68,.32]].forEach(([x,z])=>mesh(new T.BoxGeometry(.06,.78,.06),0x6b7280,g,{p:[x,.39,z]}));
  mesh(new T.BoxGeometry(.7,.45,.05),0x1b2335,g,{p:[0,1.12,-.2]});const s=mesh(new T.PlaneGeometry(.62,.37),0,g,{p:[0,1.12,-.17],sh:false,m:glow(scr,.7)});
  g.userData.p=Math.random()*6;anims.push(t=>{s.material.emissiveIntensity=.5+Math.sin(t*5+g.userData.p)*.15});return g}

/* ---------- 车间（建筑） ---------- */
const W=12,D=9,H=3.2;
function building(m,i){
  const g=new T.Group();g.position.set(m.pos[0],0,m.pos[1]);scene.add(g);
  const front=m.pos[1]<0?1:-1;// 正面朝向主干道
  g.rotation.y=front>0?0:Math.PI;
  const col=new T.Color(m.c);
  const B={m,i,g,roof:null,roofY:0,lift:0,liftT:0,tagY:H+4.2};
  g.userData.mod=i;clickables.push(g);
  if(m.type==="dome"){domeBuild(B);buildings.push(B);return B}
  if(m.type==="garden"){gardenBuild(B);buildings.push(B);return B}
  // 地基 + 地板
  mesh(new T.BoxGeometry(W+1.2,.35,D+1.2),0xcfc8b8,g,{p:[0,.17,0]});
  mesh(new T.BoxGeometry(W,.06,D),0xdfe6ec,g,{p:[0,.38,0],sh:false});
  // 安全黄线
  const yl=new T.MeshBasicMaterial({color:0xf6c93b});
  [[0,D/2-1.3,W-1.6,.08],[0,-D/2+1.3,W-1.6,.08]].forEach(([x,z,w,d])=>mesh(new T.PlaneGeometry(w,d),0,g,{p:[x,.42,z],r:[-Math.PI/2,0,0],sh:false,m:yl}));
  // 墙
  const wallM=mat(0xf2f0ea),wallD=mat(0x2f3946);
  mesh(new T.BoxGeometry(W,H,.3),0,g,{p:[0,H/2+.35,-D/2],m:wallM});
  [-1,1].forEach(sx=>mesh(new T.BoxGeometry(.3,H,D),0,g,{p:[sx*W/2,H/2+.35,0],m:wallM}));
  // 正面：两段墙 + 大门 + 玻璃窗
  mesh(new T.BoxGeometry(W*.32,H,.3),0,g,{p:[-W*.34,H/2+.35,D/2],m:wallM});mesh(new T.BoxGeometry(W*.32,H,.3),0,g,{p:[W*.34,H/2+.35,D/2],m:wallM});
  mesh(new T.BoxGeometry(W*.36,.7,.32),0,g,{p:[0,H+.0,D/2],m:wallD});
  const winM=glow(0xbfe8ff,.08);
  [-W*.34,W*.34].forEach(x=>mesh(new T.BoxGeometry(W*.26,.9,.34),0,g,{p:[x,H*.62+.35,D/2],m:winM}));
  [-1,1].forEach(sx=>{for(let k=-1;k<=1;k++)mesh(new T.BoxGeometry(.34,.9,1.6),0,g,{p:[sx*W/2,H*.62+.35,k*2.6],m:winM})});
  // 墙顶色带
  mesh(new T.BoxGeometry(W+.4,.25,.45),0,g,{p:[0,H+.45,D/2],m:mat(col.getHex())});
  // 招牌
  screen(g,canvasTex([`${m.no}  ${m.name}`],{w:640,h:120,bg:"#0c1712",fg:m.c,size:64,border:m.c}),4.6,.86,[0,H+1.05,D/2+.2]);
  // 屋顶（可掀开）
  const roof=new T.Group();roof.position.y=H+.35;g.add(roof);
  const rc=col.clone().lerp(new T.Color(0x6b4a3a),.35).getHex();
  const sh=new T.Shape();sh.moveTo(-D/2-.5,0);sh.lineTo(0,1.7);sh.lineTo(D/2+.5,0);sh.lineTo(-D/2-.5,0);
  const rg=new T.ExtrudeGeometry(sh,{depth:W+.8,bevelEnabled:false});rg.translate(0,0,-(W+.8)/2);
  const rm=mesh(rg,rc,roof,{r:[0,Math.PI/2,0],ol:.012});
  // 屋顶天窗 / 太阳能板
  for(let k=-1;k<=1;k++){const p=mesh(new T.BoxGeometry(2.2,.08,1.6),0x2a4d7a,roof,{p:[k*3.2,1.05,-1.1],r:[-.36,0,0]});mesh(new T.BoxGeometry(2.3,.04,1.7),0xd7dee8,p,{p:[0,-.05,0],sh:false})}
  const vent=mesh(new T.CylinderGeometry(.35,.35,.6,12),0x9aa6b8,roof,{p:[W/2-1.6,1.1,1.2]});
  roof.traverse(o=>{if(o.material&&o.material!==OUTL){o.material=o.material.clone();o.material.transparent=true}});
  B.roof=roof;B.roofY=roof.position.y;
  // 内部
  interior(B,m.type,col);
  buildings.push(B);return B}

/* ---------- 各车间内部 ---------- */
function interior(B,type,col){
  const g=B.g,y=.4;
  if(type==="hall"){ // 报到大厅
    mesh(new T.BoxGeometry(5,.95,1),0xe7e1d2,g,{p:[0,y+.48,-1.8]});mesh(new T.BoxGeometry(5.1,.1,1.1),new T.Color(B.m.c).getHex(),g,{p:[0,y+1,-1.8]});
    officer(g,[-1.4,y,-2.7]);officer(g,[1.4,y,-2.7]);
    screen(g,canvasTex(["欢迎新警","与AI共事 · 新警AI训练营"],{w:800,h:300,size:96,fg:"#58d7ff"}),6,2.25,[0,y+2.2,-D/2+.2]);
    for(let k=0;k<4;k++)officer(g,[-.6+k*.25,y,.2+k*.95],Math.PI,.95);
    bot(g,[2.6,y,.8],-.6,1.1);
    ["#58d7ff","#4dff9a","#f6f03b"].forEach((c,k)=>mesh(new T.CylinderGeometry(.08,.08,1,8),0xc9ced8,g,{p:[-4+k*.6,y+.5,1.6]}));
  }
  if(type==="theater"){ // AI 认知馆：大屏 + 神经网络 + 座位
    screen(g,canvasTex(["大模型 · 猜下一个词","监狱人民警察必须 → 严格 64%"],{w:900,h:300,size:80,fg:"#4d9bff"}),6.4,2.1,[0,y+2.1,-D/2+.2]);
    const net=new T.Group();net.position.set(0,y+2.0,-1.6);g.add(net);
    const pts=[];for(let k=0;k<26;k++){const v=new T.Vector3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().multiplyScalar(rnd(.6,1));pts.push(v);mesh(new T.SphereGeometry(.07,8,6),0,net,{p:[v.x,v.y,v.z],sh:false,m:glow(0x4d9bff,.8)})}
    const lp=[];pts.forEach((a,k)=>pts.forEach((b,j)=>{if(j>k&&a.distanceTo(b)<.75)lp.push(a,b)}));
    net.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(lp),new T.LineBasicMaterial({color:0x8fc3ff})));
    mesh(new T.IcosahedronGeometry(.32,0),0,net,{m:glow(0xf6f03b,.6)});
    anims.push(t=>{net.rotation.y=t*.6;net.rotation.x=Math.sin(t*.4)*.3});
    for(let r=0;r<3;r++)for(let c=0;c<5;c++){mesh(new T.BoxGeometry(.7,.45,.6),0x3f5fa0,g,{p:[-3.2+c*1.6,y+.23,.6+r*1.25]});officer(g,[-3.2+c*1.6,y+.2,.75+r*1.25],Math.PI,.85)}
    bot(g,[3.8,y,-2.4],-.4,1.15);
  }
  if(type==="vault"){ // 保密红线室：服务器 | 激光墙 | 外网球
    for(let k=0;k<3;k++){const r=mesh(new T.BoxGeometry(1,2.1,.9),0x1f3a66,g,{p:[-4.4+k*1.2,y+1.05,-2.4]});for(let j=0;j<5;j++)mesh(new T.BoxGeometry(.7,.06,.02),0,r,{p:[0,.8-j*.38,.46],sh:false,m:glow(0x4dff9a,.9)})}
    officer(g,[-3.2,y,.6],.4);
    const wall=new T.Group();wall.position.set(0,y,0);g.add(wall);
    const wm=new T.MeshBasicMaterial({color:0xff4d5a,transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide});
    mesh(new T.PlaneGeometry(D-1,2.8),0,wall,{p:[0,1.4,0],r:[0,Math.PI/2,0],sh:false,m:wm});
    for(let k=0;k<8;k++)mesh(new T.BoxGeometry(.04,.04,D-1),0,wall,{p:[0,.3+k*.34,0],sh:false,m:new T.MeshBasicMaterial({color:0xff7a85})});
    const orbs=[];for(let k=0;k<3;k++){const o=mesh(new T.SphereGeometry(.42,16,12),0,g,{p:[3.6,y+1.2+k*.25,-2.4+k*2.2],m:glow(0x58d7ff,.5)});orbs.push(o)}
    const pk=[];for(let k=0;k<10;k++){const p=mesh(new T.OctahedronGeometry(.14),0,g,{sh:false,m:glow(0xf6f03b,.9)});p.userData={o:k%3,ph:k/10};pk.push(p)}
    const alarm=mesh(new T.CylinderGeometry(.25,.3,.35,12),0,g,{p:[0,y+3.05,-D/2+.5],m:glow(0xff4d5a,.6)});
    anims.push(t=>{wm.opacity=.28+Math.sin(t*4)*.1;alarm.material.emissiveIntensity=.4+Math.max(0,Math.sin(t*6))*.9;
      pk.forEach(p=>{const u=p.userData;const k=((t*.5+u.ph)%1);const o=orbs[u.o].position;const hit=k<.6;
        p.position.set(hit?T.MathUtils.lerp(o.x,.25,k/.6):T.MathUtils.lerp(.25,2.2,(k-.6)/.4),o.y+(hit?0:Math.sin((k-.6)*8)*.4),o.z*(hit?1:.85));p.rotation.y=t*3})});
    mesh(new T.TorusGeometry(.55,.09,8,24),0,g,{p:[-1.6,y+2.6,-D/2+.3],m:glow(0xff4d5a,.4)});
  }
  if(type==="office"){ // 文书谈话工坊
    for(let k=0;k<3;k++){desk(g,[-3.6+k*2.2,y,-2.6],0,0xffa24d);officer(g,[-3.6+k*2.2,y,-1.7],Math.PI,.9)}
    // 谈话陪练：民警对机器人
    [[-2.2,1.6],[2.2,1.6]].forEach(([x,z],k)=>{mesh(new T.CylinderGeometry(.75,.75,.06,20),0xe8e2d4,g,{p:[x,y+.72,z]});mesh(new T.CylinderGeometry(.06,.06,.7,8),0x6b7280,g,{p:[x,y+.36,z]});
      officer(g,[x-1.05,y,z],Math.PI/2,.9);bot(g,[x+1.05,y,z],-Math.PI/2,.85,k?0xffe0b8:0xf4f7fb);
      const bub=mesh(new T.SphereGeometry(.22,12,10),0,g,{p:[x,y+2.2,z],s:[1.6,1,.4],sh:false,m:glow(0xffffff,.4)});
      anims.push(t=>{const ph=(t*.7+k*.5)%2;bub.position.x=x+(ph<1?-.6:.6);bub.material.emissive.set(ph<1?0xffd27a:0x8fe9ff)})});
    for(let k=0;k<6;k++)mesh(new T.BoxGeometry(.5,.04,.7),0xffffff,g,{p:[3.9,y+.9+k*.06,-2.5],r:[0,rnd(-.3,.3),0]});
    mesh(new T.BoxGeometry(1.2,1.8,.5),0x8a5a3a,g,{p:[4.6,y+.9,-2.6]});
  }
  if(type==="factory"){ // 智能体工厂：传送带 + 机械臂 + 模块
    mesh(new T.BoxGeometry(W-2,.6,1.1),0x39424f,g,{p:[0,y+.3,-.6]});
    [-1,1].forEach(s=>mesh(new T.BoxGeometry(W-2,.12,.1),0xf6c93b,g,{p:[0,y+.66,-.6+s*.55]}));
    const cols=[0x4d9bff,0xa882ff,0x4dff9a,0xff8a4d];const boxes=[];
    for(let k=0;k<8;k++){const b=mesh(new T.BoxGeometry(.5,.5,.5),cols[k%4],g,{p:[0,y+.95,-.6],ol:.03});b.userData.ph=k/8;boxes.push(b)}
    const core=mesh(new T.IcosahedronGeometry(.7,0),0,g,{p:[0,y+2.2,-2.8],m:glow(0xf6f03b,.5)});
    function arm(x){const a=new T.Group();a.position.set(x,y,.9);g.add(a);mesh(new T.CylinderGeometry(.38,.45,.4,16),0x39424f,a,{p:[0,.2,0]});
      const j=new T.Group();j.position.y=.45;a.add(j);mesh(new T.BoxGeometry(.28,1.5,.28),0xffb21f,j,{p:[0,.75,0],ol:.03});
      const j2=new T.Group();j2.position.y=1.5;j.add(j2);mesh(new T.BoxGeometry(.22,1.1,.22),0xffb21f,j2,{p:[0,.55,0],ol:.03});mesh(new T.BoxGeometry(.4,.14,.4),0x39424f,j2,{p:[0,1.12,0]});
      const ph=Math.random()*6;anims.push(t=>{a.rotation.y=Math.sin(t*.9+ph)*.8;j.rotation.x=-.35+Math.sin(t*1.3+ph)*.25;j2.rotation.x=-1.1+Math.sin(t*1.3+ph+1)*.35})}
    arm(-3);arm(3);
    bot(g,[-4.4,y,2.4],.4,1);bot(g,[4.3,y,2.3],-.5,1);officer(g,[0,y,2.6],Math.PI,.95);
    anims.push((t)=>{core.rotation.y=t;core.rotation.x=t*.6;core.scale.setScalar(1+Math.sin(t*3)*.06);
      boxes.forEach(b=>{const k=(t*.12+b.userData.ph)%1;b.position.x=-(W-2.6)/2+k*(W-2.6);b.rotation.y=k*4})});
  }
  if(type==="studio"){ // 短视频演播厅
    mesh(new T.BoxGeometry(5,3,.1),0x2fbf6a,g,{p:[-.8,y+1.5,-D/2+.35]});
    mesh(new T.CylinderGeometry(1.8,1.8,.12,32),0x8a6ad8,g,{p:[-.8,y+.06,-2.2]});
    officer(g,[-.8,y+.12,-2.2],0,1.05);
    const camG=new T.Group();camG.position.set(1.6,y,1.4);camG.rotation.y=-2.6;g.add(camG);
    [-.3,0,.3].forEach((x,k)=>mesh(new T.CylinderGeometry(.03,.03,1.4,6),0x39424f,camG,{p:[x*.7,.7,k===1?-.25:.12],r:[k===1?-.2:.1,0,x*.6]}));
    mesh(new T.BoxGeometry(.7,.5,.9),0x1b2335,camG,{p:[0,1.5,0]});mesh(new T.CylinderGeometry(.18,.22,.4,16),0x111827,camG,{p:[0,1.5,.6],r:[Math.PI/2,0,0]});
    const rec=mesh(new T.SphereGeometry(.06,8,6),0,camG,{p:[.28,1.8,.3],m:glow(0xff4d5a,1)});
    [[-4,-1],[2.6,-3.2]].forEach(([x,z])=>{mesh(new T.CylinderGeometry(.04,.04,2.4,6),0x39424f,g,{p:[x,y+1.2,z]});const l=mesh(new T.BoxGeometry(.7,.5,.4),0,g,{p:[x,y+2.5,z],r:[.4,x<0?.6:-.6,0],m:glow(0xfff2b0,.7)})});
    for(let k=0;k<3;k++){const m=mesh(new T.BoxGeometry(1.1,.7,.08),0x1b2335,g,{p:[3.4,y+.9+k*.8,1.8-k*.2],r:[0,-.6,0]});mesh(new T.PlaneGeometry(.96,.58),0,m,{p:[0,0,.05],sh:false,m:glow([0xc18bff,0x58d7ff,0xf6f03b][k],.8)})}
    bot(g,[3.8,y,-1.2],-.8,1);
    const clap=new T.Group();clap.position.set(-3.6,y+1.1,1.8);g.add(clap);mesh(new T.BoxGeometry(.8,.5,.06),0x1b2335,clap);const top=mesh(new T.BoxGeometry(.8,.12,.06),0xffffff,clap,{p:[0,.32,0]});
    anims.push(t=>{rec.material.emissiveIntensity=Math.sin(t*6)>0?1.2:.1;top.rotation.z=Math.max(0,Math.sin(t*2))*.5;camG.rotation.y=-2.6+Math.sin(t*.6)*.25});
  }
}
function domeBuild(B){const g=B.g;
  mesh(new T.CylinderGeometry(5.2,5.6,.5,40),0xcfc8b8,g,{p:[0,.25,0]});
  mesh(new T.CylinderGeometry(4.6,4.6,2.2,40,1,true),0,g,{p:[0,1.6,0],m:mat(0xf2f0ea,{side:T.DoubleSide})});
  const winM=glow(0xbfe8ff,.1);for(let k=0;k<12;k++){const a=k/12*Math.PI*2;mesh(new T.BoxGeometry(1.4,.9,.12),0,g,{p:[Math.cos(a)*4.62,1.7,Math.sin(a)*4.62],r:[0,-a+Math.PI/2,0],m:winM})}
  mesh(new T.TorusGeometry(4.7,.18,8,48),0xf6c93b,g,{p:[0,2.75,0],r:[Math.PI/2,0,0]});
  // 控制台
  mesh(new T.CylinderGeometry(2.2,2.4,.9,24),0x1f3a66,g,{p:[0,.95,0]});
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2;const s=mesh(new T.BoxGeometry(1.1,.6,.06),0x1b2335,g,{p:[Math.cos(a)*2.3,1.7,Math.sin(a)*2.3],r:[-.4,-a+Math.PI/2,0]});mesh(new T.PlaneGeometry(.95,.48),0,s,{p:[0,0,.04],sh:false,m:glow([0xf6f03b,0x4dff9a,0x58d7ff][k%3],.8)})}
  for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.4;officer(g,[Math.cos(a)*3.3,.5,Math.sin(a)*3.3],-a-Math.PI/2,.95)}
  const holo=new T.Group();holo.position.y=2.3;g.add(holo);
  const ringM=new T.MeshBasicMaterial({color:0x4dff9a,transparent:true,opacity:.75});
  mesh(new T.TorusGeometry(1.1,.04,6,40),0,holo,{r:[Math.PI/2,0,0],sh:false,m:ringM});
  const spark=mesh(new T.SphereGeometry(.13,10,8),0,holo,{sh:false,m:glow(0xf6f03b,1.2)});
  ["AI","人","制","复"].forEach((t,k)=>{const a=k/4*Math.PI*2;mesh(new T.SphereGeometry(.18,10,8),0,holo,{p:[Math.cos(a)*1.1,0,Math.sin(a)*1.1],sh:false,m:glow([0x58d7ff,0xf6f03b,0x4dff9a,0xc18bff][k],.9)})});
  // 穹顶（可掀开）
  const roof=new T.Group();roof.position.y=2.7;g.add(roof);
  const glass=new T.MeshPhysicalMaterial({color:0x9fd8ff,transparent:true,opacity:.55,roughness:.15,metalness:.1});
  mesh(new T.SphereGeometry(4.6,40,20,0,Math.PI*2,0,Math.PI/2),0,roof,{m:glass});
  for(let k=0;k<8;k++){const a=k/8*Math.PI;const rib=mesh(new T.TorusGeometry(4.62,.07,6,40,Math.PI),0x2f3946,roof,{r:[0,a,0]})}
  mesh(new T.TorusGeometry(2.4,.07,6,40),0x2f3946,roof,{p:[0,3.9,0],r:[Math.PI/2,0,0]});
  mesh(new T.CylinderGeometry(.18,.25,1,10),0x39424f,roof,{p:[0,5,0]});
  const beacon=mesh(new T.SphereGeometry(.42,16,12),0,roof,{p:[0,5.75,0],m:glow(0xf6f03b,1)});
  const pl=new T.PointLight(0xfff0a0,0,26);pl.position.set(0,6.2,0);roof.add(pl);B.pl=pl;
  const beam=mesh(new T.ConeGeometry(1.4,6,20,1,true),0,roof,{p:[0,5.8,2.8],r:[Math.PI/2.2,0,0],sh:false,m:new T.MeshBasicMaterial({color:0xfff6b0,transparent:true,opacity:.0,depthWrite:false,side:T.DoubleSide})});
  const beamG=new T.Group();beamG.position.y=5.8;roof.add(beamG);beam.position.set(0,0,2.8);beamG.add(beam);
  roof.traverse(o=>{if(o.material&&o.material!==OUTL&&o.material!==glass){o.material=o.material.clone();o.material.transparent=true}});
  B.roof=roof;B.roofY=roof.position.y;B.tagY=10.5;B.beam=beam;
  anims.push(t=>{holo.rotation.y=t*.8;const a=t*1.6;spark.position.set(Math.cos(a)*1.1,0,Math.sin(a)*1.1);beacon.material.emissiveIntensity=.8+Math.sin(t*4)*.4;beamG.rotation.y=t*1.2;beam.material.opacity=night*.22})}
function gardenBuild(B){const g=B.g;g.rotation.y=0;
  mesh(new T.CylinderGeometry(9,9,.12,40),0x8fdc7a,g,{p:[0,.06,0],sh:false});
  mesh(new T.RingGeometry(3.2,4.2,40),0xe9e2cf,g,{p:[0,.14,0],r:[-Math.PI/2,0,0],sh:false});
  // 喷泉
  mesh(new T.CylinderGeometry(2.2,2.4,.6,32),0xd7d2c4,g,{p:[0,.3,0]});mesh(new T.CylinderGeometry(2,2,.1,32),0x58b8ff,g,{p:[0,.58,0],sh:false});
  mesh(new T.CylinderGeometry(.25,.35,1.4,12),0xd7d2c4,g,{p:[0,1,0]});
  const N=120,pos=new Float32Array(N*3),v=[];for(let k=0;k<N;k++){v.push([rnd(-1,1),rnd(2.5,3.6),rnd(-1,1),Math.random()]);}
  const pg=new T.BufferGeometry();pg.setAttribute("position",new T.BufferAttribute(pos,3));
  const water=new T.Points(pg,new T.PointsMaterial({color:0xcff0ff,size:.16}));g.add(water);
  anims.push(t=>{for(let k=0;k<N;k++){const [vx,vy,vz,ph]=v[k];const s=((t*.9+ph)%1)*1.3;pos[k*3]=vx*s*1.1;pos[k*3+1]=1.7+vy*s-4.9*s*s*.7;pos[k*3+2]=vz*s*1.1;if(pos[k*3+1]<.6)pos[k*3+1]=.6}pg.attributes.position.needsUpdate=true});
  // 凉亭（顶可掀开）
  const gz=new T.Group();gz.position.set(5.2,0,-4);g.add(gz);
  [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]].forEach(([x,z])=>mesh(new T.CylinderGeometry(.1,.1,2.4,8),0xb5763c,gz,{p:[x,1.2,z]}));
  mesh(new T.CylinderGeometry(1.5,1.5,.1,16),0xe8e2d4,gz,{p:[0,.05,0]});
  const roof=new T.Group();roof.position.y=2.4;gz.add(roof);mesh(new T.ConeGeometry(2.1,1.2,4),0xd9534f,roof,{p:[0,.6,0],r:[0,Math.PI/4,0],ol:.02});
  roof.traverse(o=>{if(o.material&&o.material!==OUTL){o.material=o.material.clone();o.material.transparent=true}});
  B.roof=roof;B.roofY=2.4;B.tagY=6.5;
  officer(gz,[-.4,.1,.2],.6,.9);bot(gz,[.5,.1,-.2],-2.2,.8);
  [[-5,3,.6],[-5.5,-2,-.4],[3.5,5,2.4],[-1,6,3.1]].forEach(([x,z,r])=>{bench(B.m.pos[0]+x,B.m.pos[1]+z,r)});
  [[-6.5,-6],[6.5,5.5],[-7,5],[2,-7.2],[7.5,0],[-3,-7.4]].forEach(([x,z])=>tree(B.m.pos[0]+x,B.m.pos[1]+z,rnd(1,1.4),Math.floor(rnd(0,3))));
  // 花
  const fc=[0xf6f03b,0xff8fb1,0xffffff,0xc18bff];for(let k=0;k<60;k++){const a=rnd(0,Math.PI*2),r=rnd(5,8.6);mesh(new T.SphereGeometry(.12,6,5),0,g,{p:[Math.cos(a)*r,.25,Math.sin(a)*r],sh:false,m:new T.MeshBasicMaterial({color:fc[k%4]})})}
}

/* ---------- 太阳能板阵列 & 停车场 ---------- */
(function(){const g=new T.Group();g.position.set(38,0,0);scene.add(g);
  for(let r=0;r<5;r++)for(let c=0;c<3;c++){const p=new T.Group();p.position.set(-4+c*4,0,-10+r*5);g.add(p);mesh(new T.BoxGeometry(.12,1,.12),0x6b7280,p,{p:[0,.5,0]});const pn=mesh(new T.BoxGeometry(3.4,.08,2),0x2a4d7a,p,{p:[0,1.1,0],r:[-.45,0,0]});mesh(new T.BoxGeometry(3.5,.04,2.1),0xd7dee8,pn,{p:[0,-.05,0],sh:false})}})();

/* ---------- 建造 ---------- */
MODS.forEach(building);

/* ---------- 数据传送带：各车间 → 调度中心 ---------- */
const belts=[];
MODS.forEach((m,i)=>{if(m.type==="dome")return;
  const sx=m.pos[0],sz=m.pos[1];let path;
  if(m.type==="garden")path=[[sx+9,0],[-8,0]];
  else{const fz=sz<0?sz+D/2+.9:sz-D/2-.9;path=[[sx,fz],[sx,Math.sign(sz)*1.6],[Math.sign(-sx||1)*0+ (sx===0?0:Math.sign(sx)*7.6),Math.sign(sz)*1.6]];if(sx===0)path=[[0,fz],[0,Math.sign(sz)*7.7]]}
  const pts=path.map(([x,z])=>new T.Vector3(x,.32,z));
  for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1];const L=a.distanceTo(b);const mid=a.clone().add(b).multiplyScalar(.5);
    const bm=mesh(new T.BoxGeometry(.9,.18,L+.9),0x2f3946,scene,{p:[mid.x,.2,mid.z]});bm.lookAt(b.x,.2,b.z);
    const rl=mesh(new T.BoxGeometry(1.05,.06,L+.9),0xf6c93b,scene,{p:[mid.x,.11,mid.z],sh:false});rl.lookAt(b.x,.11,b.z)}
  const curve=new T.CurvePath();for(let k=0;k<pts.length-1;k++)curve.add(new T.LineCurve3(pts[k].clone().setY(.48),pts[k+1].clone().setY(.48)));
  const cubes=[];const cm=glow(new T.Color(m.c).getHex(),.7);
  for(let k=0;k<4;k++){const c=mesh(new T.BoxGeometry(.38,.38,.38),0,scene,{m:cm});c.userData.ph=k/4;cubes.push(c)}
  belts.push({curve,cubes,i});
});
anims.push(t=>{belts.forEach(b=>{const run=!stopped[b.i];b.cubes.forEach(c=>{if(run)c.userData.k=((c.userData.k??c.userData.ph)+0.0025)%1;const p=b.curve.getPointAt(c.userData.k??c.userData.ph);c.position.copy(p);c.rotation.y=t})})});

/* ---------- 巡逻车 ---------- */
const loop=[[-29.5,-27.5],[29.5,-27.5],[29.5,27.5],[-29.5,27.5]];
const loopCurve=new T.CurvePath();for(let k=0;k<4;k++){const a=loop[k],b=loop[(k+1)%4];loopCurve.add(new T.LineCurve3(new T.Vector3(a[0],0,a[1]),new T.Vector3(b[0],0,b[1])))}
const cars=[];[0,.27,.55,.8].forEach((ph,k)=>{const c=new T.Group();scene.add(c);
  mesh(new T.BoxGeometry(1.4,.7,2.4),[0xffffff,0x2c4f86,0xf6c93b,0xffffff][k],c,{p:[0,.6,0],ol:.03});mesh(new T.BoxGeometry(1.2,.5,1.2),0x9fd8ff,c,{p:[0,1.15,-.2]});
  [[-.7,-.75],[.7,-.75],[-.7,.75],[.7,.75]].forEach(([x,z])=>mesh(new T.CylinderGeometry(.26,.26,.2,12),0x1b2335,c,{p:[x,.26,z],r:[0,0,Math.PI/2]}));
  if(k===1){const lb=mesh(new T.BoxGeometry(.7,.16,.25),0,c,{p:[0,1.5,-.2],m:glow(0xff4d5a,.6)});anims.push(t=>{lb.material.emissive.set(Math.sin(t*8)>0?0xff4d5a:0x4d7dff)})}
  cars.push({c,ph,sp:rnd(.018,.026)})});
anims.push((t)=>{cars.forEach(o=>{const k=(o.ph+t*o.sp)%1;const p=loopCurve.getPointAt(k),p2=loopCurve.getPointAt((k+.002)%1);o.c.position.copy(p);o.c.position.x+= (p2.z-p.z)!==0?0:0;o.c.lookAt(p2)})});
// 园区里走动的巡逻机器人
for(let k=0;k<6;k++){const b=bot(scene,[0,0,0],0,1.1);const ph=k/6;const pathR=k%2?11:12.5;anims.push(t=>{const a=ph*Math.PI*2+t*.08*(k%2?1:-1);b.position.set(Math.cos(a)*pathR*1.9,0,Math.sin(a)*2.0);b.rotation.y=-a+(k%2?0:Math.PI)})}

/* ---------- 天上的云 ---------- */
const cloudM=new T.MeshLambertMaterial({color:0xffffff,emissive:0xcfe6fb,emissiveIntensity:.4,transparent:true,opacity:.92});
const clouds=[];for(let k=0;k<7;k++){const c=new T.Group();for(let j=0;j<5;j++){const s=new T.Mesh(new T.SphereGeometry(rnd(1.6,2.6),12,10),cloudM);s.position.set(j*2.2-4,rnd(-.3,.6),rnd(-1,1));s.scale.y=.7;c.add(s)}c.position.set(rnd(-90,90),rnd(26,34),rnd(-80,30));c.userData.v=rnd(.6,1.4);scene.add(c);clouds.push(c)}
anims.push((t,dt)=>clouds.forEach(c=>{c.position.x+=c.userData.v*dt;if(c.position.x>110)c.position.x=-110}));

/* ================================================================
   相机：拖动旋转 · 滚轮缩放 · 飞行
   ================================================================ */
const view={target:new T.Vector3(0,0,2),r:96,th:.62,ph:.88};
const goal={target:view.target.clone(),r:view.r,th:view.th,ph:view.ph};
let flyT=1;const from={};
function flyTo(t,r,th,ph,d=1.2){from.target=view.target.clone();from.r=view.r;from.th=view.th;from.ph=view.ph;goal.target.copy(t);goal.r=r;goal.th=th;goal.ph=ph;flyT=0;flyDur=d}
let flyDur=1.2;
function applyCam(){const sp=Math.sin(view.ph);cam.position.set(view.target.x+view.r*sp*Math.sin(view.th),view.target.y+view.r*Math.cos(view.ph),view.target.z+view.r*sp*Math.cos(view.th));cam.lookAt(view.target)}
let drag=null,moved=0;
canvas.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY,id:e.pointerId};moved=0;stopPatrol()});
window.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved+=Math.abs(dx)+Math.abs(dy);drag.x=e.clientX;drag.y=e.clientY;
  if(moved>4){flyT=1;view.th-=dx*.005;view.ph=Math.max(.35,Math.min(1.22,view.ph-dy*.004));goal.th=view.th;goal.ph=view.ph}});
window.addEventListener("pointerup",e=>{if(drag&&moved<6)pick(e);drag=null});
canvas.addEventListener("wheel",e=>{e.preventDefault();flyT=1;view.r=Math.max(16,Math.min(150,view.r*(1+Math.sign(e.deltaY)*.08)));goal.r=view.r},{passive:false});
// 双指缩放
let pinch=0;canvas.addEventListener("touchmove",e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch){view.r=Math.max(16,Math.min(150,view.r*pinch/d));goal.r=view.r}pinch=d;drag=null}},{passive:true});
canvas.addEventListener("touchend",()=>pinch=0);

const ray=new T.Raycaster(),mv=new T.Vector2();
function pick(e){if(!R)return;const r=canvas.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,cam);
  const hit=ray.intersectObjects(clickables,true)[0];if(!hit){select(-1);return}
  let o=hit.object;while(o&&o.userData.mod===undefined)o=o.parent;if(o)select(o.userData.mod)}

/* ================================================================
   选择 / 屋顶掀开 / 浮窗 / 抽屉
   ================================================================ */
let sel=-1;const stopped={};
function select(i,fly=true){
  sel=i;buildings.forEach((b,k)=>b.liftT=k===i?1:0);
  $$(".tag").forEach((t,k)=>t.classList.toggle("on",k===i));
  $$("#missions li").forEach((t,k)=>t.classList.toggle("on",k===i));
  $$(".tlbar .seg").forEach((t,k)=>t.classList.toggle("on",k===i));
  const pop=$("#pop");
  if(i<0){pop.hidden=true;setCur(-1);if(fly)flyTo(new T.Vector3(0,0,2),MOBILE?120:96,view.th,.88);return}
  const m=MODS[i];setCur(i);
  $("#popNo").textContent=m.no;$("#popNo").style.color=m.c;$("#popName").textContent=m.name;$("#popTime").textContent=`${m.sub} · ${m.time}–${m.end} · ${m.t1-m.t0} 分钟`;
  $("#popDesc").textContent=m.desc;$("#popTasks").innerHTML=m.tasks.map(t=>`<span>${t}</span>`).join("");
  pop.hidden=false;pop.style.animation="none";pop.offsetHeight;pop.style.animation="";
  if(fly){const b=buildings[i];const p=b.g.position;const r=m.type==="dome"?26:m.type==="garden"?30:28;
    const off=MOBILE?4:6.5;flyTo(new T.Vector3(p.x+Math.sin(view.th)*off,1.5,p.z+Math.cos(view.th)*off),MOBILE?r*1.5:r*1.15,view.th,.8)}
  log(`${m.agent} · 车间 ${m.no} 已选中，屋顶掀开`,"ok");
}
function setCur(i){if(i<0){$("#curNo").textContent="00";$("#curName").textContent="园区总览";$("#curSt").textContent="待命";return}
  const m=MODS[i];$("#curNo").textContent=m.no;$("#curName").textContent=m.name;$("#curSt").textContent=visited[m.id]?"已完成":"运行中"}

const drawer=$("#drawer"),dwBody=$("#dwBody"),lib=$("#library");
let open=-1;
function openMod(i){if(i<0||i>=MODS.length)return;const m=MODS[i];
  // 先把上一个模块的内容放回仓库
  [...dwBody.children].forEach(c=>lib.appendChild(c));
  m.secs.forEach(id=>{const s=document.getElementById(id);if(s)dwBody.appendChild(s)});
  if(i===MODS.length-1){const f=lib.querySelector(".lib-foot");if(f)dwBody.appendChild(f)}
  dwBody.scrollTop=0;setTimeout(revealCheck,650);
  $("#dwNo").textContent=m.no;$("#dwNo").style.color=m.c;$("#dwName").textContent=`${m.name} · ${m.sub}`;$("#dwTime").textContent=`${m.time}–${m.end}`;
  drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");open=i;
  visited[m.id]=1;store.set("visited",visited);renderMissions();
  if(sel!==i)select(i);
  $("#pop").hidden=true;log(`${m.agent} · 课件已打开：${m.name}`,"warn");
}
function revealCheck(){const H=innerHeight;dwBody.querySelectorAll(".rv:not(.in)").forEach(el=>{const r=el.getBoundingClientRect();if(r.top<H*.95&&r.bottom>0&&r.width){el.classList.add("in");el.dispatchEvent(new CustomEvent("reveal"))}})}
let rcT=0;dwBody.addEventListener("scroll",()=>{if(rcT)return;rcT=setTimeout(()=>{rcT=0;revealCheck()},120)},{passive:true});
function closeDrawer(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");open=-1;if(sel>=0)$("#pop").hidden=false}
$("#popOpen").onclick=()=>openMod(sel);
$("#popClose").onclick=()=>select(-1);
$("#dwClose").onclick=closeDrawer;
$("#dwPrev").onclick=()=>openMod((open-1+MODS.length)%MODS.length);
$("#dwNext").onclick=()=>openMod((open+1)%MODS.length);
// 课件内部的 #锚点链接 → 跳到对应车间
document.addEventListener("click",e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute("href").slice(1);if(IDX[id]===undefined)return;e.preventDefault();openMod(IDX[id])});

/* ---------- 键盘 ---------- */
document.addEventListener("keydown",e=>{if(/input|textarea/i.test(e.target.tagName))return;
  if(e.key==="Escape"){if(open>=0)closeDrawer();else select(-1);return}
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();stopPatrol();const n=e.key==="ArrowRight"?1:-1;const cur=open>=0?open:sel;const k=((cur<0?(n>0?-1:0):cur)+n+MODS.length)%MODS.length;if(open>=0)openMod(k);else select(k);return}
  if(e.key==="Enter"&&sel>=0&&open<0){openMod(sel);return}
  if(e.key==="f"||e.key==="F"){toggleFull()}
});

/* ---------- 顶栏按钮 ---------- */
function toggleFull(){if(!document.fullscreenElement)document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();else document.exitFullscreen()}
$("#btnFull").onclick=toggleFull;
$("#btnQR").onclick=e=>{e.stopPropagation();const q=$("#qrPop2");q.hidden=!q.hidden};
document.addEventListener("click",e=>{if(!e.target.closest("#qrPop2,#btnQR"))$("#qrPop2").hidden=true});
$("#btnNight").onclick=function(){night=night?0:1;this.classList.toggle("on",!!night);this.textContent=night?"白天":"夜间";log(night?"园区切换夜间模式，灯光开启":"园区切换白天模式","ok")};
$$("[data-view]").forEach(b=>b.onclick=()=>{if(b.dataset.view==="top"){stopPatrol();if(open>=0)closeDrawer();select(-1)}else togglePatrol()});

/* ---------- 巡视 ---------- */
let patrol=null,pk=0;
function togglePatrol(){if(patrol){stopPatrol();return}if(open>=0)closeDrawer();$("#btnPatrol").classList.add("on");$('[data-view="top"]').classList.remove("on");pk=sel<0?0:sel;select(pk);patrol=setInterval(()=>{pk=(pk+1)%MODS.length;select(pk)},6500);log("巡视模式启动：自动轮巡各车间","warn")}
function stopPatrol(){if(!patrol)return;clearInterval(patrol);patrol=null;$("#btnPatrol").classList.remove("on");$('[data-view="top"]').classList.add("on")}

/* ================================================================
   HUD：任务、智能体、数据、日志、时间线
   ================================================================ */
function renderMissions(){const nm=nowMod();
  $("#missions").innerHTML=MODS.map((m,i)=>{const st=visited[m.id]?"done":i===nm?"now":"";return `<li data-i="${i}" class="${st} ${i===sel?"on":""}" style="--mc:${m.c}"><span class="mn">${m.no}</span><b>${m.name}</b><span class="ms">${visited[m.id]?"已完成":i===nm?"进行中":"待开始"}</span><span class="mt">${m.sub} · ${m.time}–${m.end}</span></li>`}).join("");
  const n=Object.keys(visited).filter(k=>IDX[k]!==undefined).length;$("#missionCount").textContent=`${n}/8`;$("#kDone").textContent=n;
  $("#tlbar").innerHTML=MODS.map((m,i)=>`<div class="seg ${i===sel?"on":""}" data-i="${i}" style="--w:${m.t1-m.t0};--sc:${m.c}"><b>${m.no} ${m.name}</b><small>${m.time}</small></div>`).join("");
}
$("#missions").addEventListener("click",e=>{const li=e.target.closest("li");if(!li)return;stopPatrol();const i=+li.dataset.i;if(sel===i)openMod(i);else select(i)});
$("#tlbar").addEventListener("click",e=>{const s=e.target.closest(".seg");if(!s)return;stopPatrol();const i=+s.dataset.i;if(sel===i)openMod(i);else select(i)});
renderMissions();

// 园区智能体
$("#agentRows").innerHTML=MODS.map((m,i)=>`<div class="ar" style="--ac:${m.c}"><span>${m.agent}</span><span class="bars">${"<i></i>".repeat(10)}</span><b id="ag${i}">90%</b></div>`).join("");
const agv=MODS.map(()=>rnd(78,99));
// 均衡器
$("#eq").innerHTML="<i></i>".repeat(32);
// 标签
const tagBox=$("#tags");
MODS.forEach((m,i)=>{const d=document.createElement("div");d.className="tag";d.style.setProperty("--tc",m.c);
  d.innerHTML=`<span class="tn">${m.no}</span><b>${m.name}</b><div class="tb">${m.sub}<i style="--p:${Math.round(rnd(40,95))}%"></i><span class="pv">${m.time}</span></div>`;
  d.onclick=()=>{stopPatrol();sel===i?openMod(i):select(i)};tagBox.appendChild(d)});
const tags=$$(".tag");

const LOGS={
 open:["迎新签到完成 · 千问录音已开启","WorkBuddy 生成学习目录 ✓","投票通道开放"],
 s1:["词元预测：严格 64% / 依法 17%","检测到“幻觉”：监狱法第一百零八条不存在","真实案例库加载 6 条"],
 s2:["拦截外网数据包 ×3","脱敏检查：姓名、编号已替换","内外网物理隔离 正常"],
 s3:["谈话陪练：沉默型对象 · 共情 9 分","模板“会议纪要整理”被复制","风险信号提示：立即按程序上报"],
 rest:["休息倒计时 20:00","冷知识推送：Transformer","提醒：完成红线自测"],
 s4:["智能体组装：大模型+角色+知识库+工具","法规问答助手 测试通过 ✓","涉内部安排提问 · 已拒答"],
 s5:["分镜 6 镜生成完毕","AI 配音合成 · 0.95×","审核清单 6/6 · 待宣传部门审批"],
 end:["人在回路：AI 发现 → 民警判断","新警 AI 守则 8 条","调度总控 · 全园区运行正常"]};
function log(msg,cls=""){const d=bj();const el=document.createElement("div");el.className=cls;el.textContent=`[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}] ${msg}`;const t=$("#term");t.appendChild(el);while(t.children.length>18)t.firstChild.remove();
  $("#ticker").textContent=el.textContent;$("#ticker").style.animation="none";$("#ticker").offsetHeight;$("#ticker").style.animation=""}
setInterval(()=>{if(document.hidden)return;const i=Math.floor(Math.random()*MODS.length),m=MODS[i];const L=LOGS[m.id];const msg=L[Math.floor(Math.random()*L.length)];log(`${m.agent} · ${msg}`,/拦截|拒答|风险/.test(msg)?"stop":/✓|正常|通过/.test(msg)?"ok":"")},1900);

function hudTick(){const d=bj();$("#hudClock").textContent=`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  agv.forEach((v,i)=>{agv[i]=Math.max(62,Math.min(99.9,v+rnd(-2.5,2.5)));const el=document.getElementById("ag"+i);if(el){el.textContent=agv[i].toFixed(0)+"%";const on=Math.round(agv[i]/10);el.previousElementSibling.querySelectorAll("i").forEach((b,k)=>b.classList.toggle("on",k<on))}});
  $$("#eq i").forEach(b=>b.style.height=rnd(12,100)+"%");
  $("#kIdx").textContent=(94+Math.random()*4).toFixed(1);
  const sc=document.getElementById("quiz1Score");const mm=sc&&sc.textContent.match(/答对\s*(\d+)/);if(mm)$("#kQuiz").textContent=Math.round(+mm[1]/6*100);
  // 时间线进度
  const now=d.getHours()*60+d.getMinutes()+d.getSeconds()/60;
  $$(".tlbar .seg").forEach((s,i)=>{const m=MODS[i];const p=Math.max(0,Math.min(1,(now-m.t0)/(m.t1-m.t0)));s.style.setProperty("--p",(visited[m.id]&&p===0?100:p*100)+"%")});
}
setInterval(hudTick,1000);hudTick();
setInterval(renderMissions,30000);

/* ================================================================
   开始界面
   ================================================================ */
let started=false;
$("#startBtn").onclick=()=>{$("#start").classList.add("hide");started=true;
  view.r=150;view.ph=.5;view.th=1.6;flyTo(new T.Vector3(0,0,2),MOBILE?120:96,.62,.88,2.6);
  log("调度总控 · 园区启动，8 个车间上线","ok");setTimeout(()=>toast("点击任意车间，屋顶会掀开"),2600)};

/* ================================================================
   主循环
   ================================================================ */
const v3=new T.Vector3();
function resize(){if(!R)return;const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
addEventListener("resize",resize);resize();
let last=performance.now(),t=0,frame=0;
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
function loopFn(now){requestAnimationFrame(loopFn);if(!R)return;
  const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;frame++;
  if(document.hidden)return;
  if(open>=0&&!MOBILE&&frame%3)return;// 课件打开时降低园区帧率
  if(open>=0&&MOBILE)return;
  if(!REDUCE)t+=dt*(open>=0?3:1);
  // 相机飞行
  if(flyT<1){flyT=Math.min(1,flyT+dt/flyDur);const k=ease(flyT);view.target.lerpVectors(from.target,goal.target,k);view.r=from.r+(goal.r-from.r)*k;view.th=from.th+(goal.th-from.th)*k;view.ph=from.ph+(goal.ph-from.ph)*k}
  else if(!drag&&sel<0&&started&&!REDUCE){view.th+=dt*.025}
  applyCam();
  // 昼夜
  nightT+=(night-nightT)*Math.min(1,dt*2.5);
  scene.background.copy(DAY.bg).lerp(NIGHT.bg,nightT);scene.fog.color.copy(scene.background);
  hemi.intensity=DAY.hemi+(NIGHT.hemi-DAY.hemi)*nightT;sun.intensity=DAY.sun+(NIGHT.sun-DAY.sun)*nightT;amb.intensity=DAY.amb+(NIGHT.amb-DAY.amb)*nightT;
  glowMats.forEach(m=>{m.emissiveIntensity=Math.max(m.emissiveIntensity*0+m.userData.base, m.userData.base+nightT*(m.userData.nb||1.1))});
  buildings.forEach(b=>{if(b.pl)b.pl.intensity=nightT*1.6});
  // 屋顶
  buildings.forEach(b=>{if(!b.roof)return;b.lift+=(b.liftT-b.lift)*Math.min(1,dt*4);const L=b.lift;b.roof.position.y=b.roofY+L*(b.m.type==="dome"?7:6);b.roof.rotation.z=L*.08;
    b.roof.traverse(o=>{if(o.material===OUTL){o.visible=L<.25;return}if(o.material&&o.material.transparent&&o.material.userData.keep!==1){if(o.material.userData.o0===undefined)o.material.userData.o0=o.material.opacity;o.material.opacity=o.material.userData.o0*(1-L*.85)}})});
  anims.forEach(f=>f(t,dt));
  R.render(scene,cam);
  // 标签投影
  const W=innerWidth,H=innerHeight;
  tags.forEach((el,i)=>{const b=buildings[i];v3.set(b.g.position.x,b.tagY+b.lift*(b.m.type==="dome"?7:6),b.g.position.z);v3.project(cam);
    const vis=v3.z<1&&Math.abs(v3.x)<1.1&&Math.abs(v3.y)<1.1;el.style.opacity=vis?1:0;el.style.transform=`translate(${(v3.x+1)/2*W-16}px,${(1-v3.y)/2*H-46}px)`});
}
requestAnimationFrame(loopFn);
window.__park={select,openMod,MODS,snap(){flyT=1;view.target.copy(goal.target);view.r=goal.r;view.th=goal.th;view.ph=goal.ph;buildings.forEach(b=>b.lift=b.liftT)}};
})();
