/* 商业银行 · AI 星环（three.js）：中心总调度 + 12 个岗位智能体 */
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
const T=THREE;

/* ---------------- 课程站点 ---------------- */
const ST=[
 {id:"open",no:"01",name:"开篇 · 银行人的一天",min:5,c:"#9fe8ff",secs:["open"]},
 {id:"s1",no:"02",name:"AI 科普与技术发展",min:15,c:"#5fa8ff",secs:["s1"]},
 {id:"s2",no:"03",name:"千问 · WorkBuddy",min:15,c:"#4dffb4",secs:["s2"]},
 {id:"s3",no:"04",name:"合规红线",min:8,c:"#ff5d7a",secs:["s3"]},
 {id:"s4",no:"05",name:"高效办公文档",min:12,c:"#ffb44d",secs:["s4"]},
 {id:"s5",no:"06",name:"岗位智能体",min:25,c:"#c38bff",secs:["s5"]},
 {id:"s6",no:"07",name:"短视频宣传",min:7,c:"#ff7ad9",secs:["s6"]},
 {id:"end",no:"08",name:"结语 · 使用守则",min:3,c:"#ffe066",secs:["end","finalSec"]}];
const IDX={};ST.forEach((m,i)=>m.secs.forEach(s=>IDX[s]=i));
let visited=store.get("visited",{});

/* ---------------- 12 个岗位智能体 ---------------- */
const AG=[
 {code:"OPS",name:"柜面运营",c:"#5fe3ff",st:5,desc:"业务规程问答助手：依据公开规程作答并给出处，帮新员工快速上手。",tasks:["规程问答","标准应答话术","操作要点速查"]},
 {code:"RETAIL",name:"零售客户经理",c:"#4dff9a",st:5,desc:"客户沟通陪练员：AI 扮演不同类型客户，陪你练需求挖掘与风险揭示。",tasks:["犹豫型客户","追问收益型","投诉情绪型"]},
 {code:"WEALTH",name:"理财经理",c:"#b6ff4d",st:3,desc:"适当性与风险揭示：介绍产品前先测评，话术先过合规红线。",tasks:["风险揭示话术","不承诺收益","双录要点"]},
 {code:"CORP",name:"对公客户经理",c:"#ffe066",st:5,desc:"行业研究助手：汇总公开行业资讯与政策，生成拜访提纲。",tasks:["行业简报","拜访提纲","政策速读"]},
 {code:"CREDIT",name:"信贷审批",c:"#ffb44d",st:5,desc:"授信材料核对助手：检查材料是否齐全、表述是否一致；只提示，不下结论。",tasks:["材料清单核对","前后一致性","须行内部署"]},
 {code:"RISK",name:"风控合规",c:"#ff5d7a",st:3,desc:"营销文案合规初审员：标出“保本”“秒到账”等违规表述，提示补充风险提示。",tasks:["禁用表述识别","风险提示检查","初审报告"]},
 {code:"CARE",name:"客服",c:"#ff7ad9",st:5,desc:"客服标准问答：常见问题检索，按标准话术生成回复，复杂问题转人工。",tasks:["FAQ 检索","标准话术","转人工"]},
 {code:"OFFICE",name:"办公室",c:"#c38bff",st:4,desc:"公文与会务助手：通知起草、会议纪要、待办跟进。",tasks:["会议纪要","通知起草","汇报 PPT"]},
 {code:"HR",name:"人力培训",c:"#8b9bff",st:1,desc:"新员工学习教练：制度出题、批改、整理错题本。",tasks:["制度速读","出题自测","错题本"]},
 {code:"MEDIA",name:"宣传",c:"#ff8a5c",st:6,desc:"短视频编剧：反诈与金融知识普及，从选题到分镜到成片。",tasks:["选题","分镜脚本","合规审核"]},
 {code:"DATA",name:"数据报表",c:"#4dd8ff",st:4,desc:"Excel 报表助手：写公式、做透视、查异常，先用模拟数据练熟。",tasks:["SUMIFS 公式","数据透视","图表"]},
 {code:"CHIEF",name:"行长助理",c:"#ffd27a",st:5,desc:"管理者经营助手：汇报提炼、会议材料、政策速读；涉数须行内部署。",tasks:["汇报提炼","会议材料","推广路径"]}];
const CENTER={code:"CORE",name:"总调度 · 工作搭子",c:"#ffffff",st:0,desc:"智能体是搭子，不是替身。总调度把任务派给各岗位智能体，结果回到人手里判断、签字。",tasks:["派单","汇总","人工复核"]};
const MSG={OPS:["规程查询：对公开户所需材料","生成厅堂常见问题应答 12 条"],RETAIL:["陪练完成：犹豫型客户 · 合规 9 分","回访提纲已生成（已脱敏）"],WEALTH:["风险揭示话术检查通过","提醒：介绍产品前完成测评"],CORP:["行业简报：装备制造（公开资讯）","拜访提纲 5 条已生成"],CREDIT:["材料核对：缺少 1 项，已提示","前后表述一致性检查完成"],RISK:["拦截：“保本保息” ×1","提示：缺少风险提示语","初审不通过 · 退回修改"],CARE:["标准话术回复 · 转账限额","复杂问题已转人工"],OFFICE:["会议纪要已生成 · 待办 4 项","通知初稿待审核"],HR:["制度自测 10 题 · 正确率 80%","错题本已更新"],MEDIA:["分镜 6 镜完成 · 反诈主题","待消保与合规审核"],DATA:["SUMIFS 公式已生成（模拟数据）","异常值检查完成"],CHIEF:["汇报提纲已生成","政策要点 8 条"]};

/* ================================================================
   three.js
   ================================================================ */
const canvas=$("#ringCanvas");
let R;try{R=new T.WebGLRenderer({canvas,antialias:true,alpha:true})}catch(e){}
R&&R.setPixelRatio(Math.min(MOBILE?1.5:2,devicePixelRatio||1));
const scene=new T.Scene();
const cam=new T.PerspectiveCamera(42,1,1,2000);
const world=new T.Group();scene.add(world);
const spin=new T.Group();world.add(spin);

// 圆点贴图
const dotTex=(()=>{const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d");const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.25,"rgba(255,255,255,.85)");gr.addColorStop(.6,"rgba(255,255,255,.18)");gr.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=gr;g.fillRect(0,0,64,64);return new T.CanvasTexture(c)})();
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};

const RAD=24;// 子智能体所在半径
const clusters=[];
function cluster(pos,color,n,spread,fil){
  const g=new T.Group();g.position.copy(pos);spin.add(g);
  const col=new T.Color(color),pts=new Float32Array(n*3),cols=new Float32Array(n*3);
  for(let i=0;i<n;i++){const r=Math.abs(gauss())*spread*.55;const th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1);
    pts[i*3]=r*Math.sin(ph)*Math.cos(th);pts[i*3+1]=r*Math.sin(ph)*Math.sin(th);pts[i*3+2]=r*Math.cos(ph)*.5;
    const k=Math.random()<.18?1:rnd(.5,.95);const c=col.clone().lerp(new T.Color(0xffffff),Math.random()<.12?.6:0);cols[i*3]=c.r*k;cols[i*3+1]=c.g*k;cols[i*3+2]=c.b*k}
  const geo=new T.BufferGeometry();geo.setAttribute("position",new T.BufferAttribute(pts,3));geo.setAttribute("color",new T.BufferAttribute(cols,3));
  const mat=new T.PointsMaterial({size:spread>9?1.0:.85,map:dotTex,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.85});
  const P=new T.Points(geo,mat);g.add(P);
  // 神经纤维
  const lp=[],lc=[];
  for(let f=0;f<fil;f++){let x=gauss()*spread*.15,y=gauss()*spread*.15,z=0;let dx=gauss(),dy=gauss();const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;
    const segs=6+Math.floor(Math.random()*8),step=spread*rnd(.12,.22);
    for(let s=0;s<segs;s++){const nx=x+dx*step+gauss()*step*.5,ny=y+dy*step+gauss()*step*.5,nz=z+gauss()*step*.3;lp.push(x,y,z,nx,ny,nz);
      const k=1-s/segs;lc.push(col.r*k,col.g*k,col.b*k,col.r*k*.8,col.g*k*.8,col.b*k*.8);x=nx;y=ny;z=nz;
      if(Math.random()<.2){dx+=gauss()*.6;dy+=gauss()*.6;const l2=Math.hypot(dx,dy)||1;dx/=l2;dy/=l2}}}
  const lg=new T.BufferGeometry();lg.setAttribute("position",new T.Float32BufferAttribute(lp,3));lg.setAttribute("color",new T.Float32BufferAttribute(lc,3));
  const lm=new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.42,blending:T.AdditiveBlending,depthWrite:false});
  g.add(new T.LineSegments(lg,lm));
  // 核心光点
  const core=new T.Sprite(new T.SpriteMaterial({map:dotTex,color:col,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));core.scale.setScalar(spread*.9);g.add(core);
  const C={g,P,mat,lm,core,col,flash:0,base:mat.size,pos:g.position};clusters.push(C);return C}
if(R){
  cluster(new T.Vector3(0,0,0),"#ffffff",MOBILE?1500:2600,13,MOBILE?60:110);
  AG.forEach((a,i)=>{const th=Math.PI/2-i/AG.length*Math.PI*2;cluster(new T.Vector3(Math.cos(th)*RAD,Math.sin(th)*RAD,0),a.c,MOBILE?380:640,7.5,MOBILE?18:34)});
}
// 星空
(function(){if(!R)return;const n=1600,p=new Float32Array(n*3);for(let i=0;i<n;i++){const r=rnd(120,500),th=Math.random()*6.28,ph=Math.acos(2*Math.random()-1);p[i*3]=r*Math.sin(ph)*Math.cos(th);p[i*3+1]=r*Math.sin(ph)*Math.sin(th);p[i*3+2]=r*Math.cos(ph)-150}
  const g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(p,3));scene.add(new T.Points(g,new T.PointsMaterial({size:1.1,map:dotTex,color:0x9fb8d8,transparent:true,opacity:.55,depthWrite:false})))})();

/* ---------- 外环：刻度条 + 分区色带 + 细圈 ---------- */
const ringG=new T.Group();world.add(ringG);
if(R){
  const N=MOBILE?160:240,R0=40;
  const box=new T.PlaneGeometry(1,1);const m=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92,side:T.DoubleSide});
  const inst=new T.InstancedMesh(box,m,N);const o=new T.Object3D();
  const lens=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2;const L=rnd(2.2,4.6);lens.push(L);o.position.set(Math.cos(a)*(R0+L/2),Math.sin(a)*(R0+L/2),0);o.rotation.set(0,0,a);o.scale.set(L,.62,1);o.updateMatrix();inst.setMatrixAt(i,o.matrix)}
  ringG.add(inst);ringG.userData={inst,lens,N,R0,o};
  const thin=(r,op,c=0x9fdcff)=>{const g=new T.RingGeometry(r,r+.12,256);const mm=new T.Mesh(g,new T.MeshBasicMaterial({color:c,transparent:true,opacity:op,side:T.DoubleSide}));ringG.add(mm)};
  thin(R0-1.2,.5);thin(R0+5.6,.35);thin(R0+9.5,.18);thin(RAD+9,.08);
  AG.forEach((a,i)=>{const mid=Math.PI/2-i/AG.length*Math.PI*2,span=Math.PI*2/AG.length*.82;
    const g=new T.RingGeometry(R0+6.3,R0+7.4,48,1,mid-span/2,span);ringG.add(new T.Mesh(g,new T.MeshBasicMaterial({color:a.c,transparent:true,opacity:.75,side:T.DoubleSide})))});
  // 内圈虚线
  const dash=new T.Group();for(let i=0;i<72;i++){const a=i/72*Math.PI*2;const s=new T.Mesh(new T.PlaneGeometry(1.4,.18),new T.MeshBasicMaterial({color:0x5fe3ff,transparent:true,opacity:.35,side:T.DoubleSide}));s.position.set(Math.cos(a)*(R0-3),Math.sin(a)*(R0-3),0);s.rotation.z=a+Math.PI/2;dash.add(s)}ringG.add(dash);ringG.userData.dash=dash;
}

/* ---------- 任务光点 ---------- */
const pulses=[];
const pulseMat=c=>new T.SpriteMaterial({map:dotTex,color:new T.Color(c),transparent:true,blending:T.AdditiveBlending,depthWrite:false});
function send(from,to,color){if(!R)return;const s=new T.Sprite(pulseMat(color));s.scale.setScalar(2.4);spin.add(s);
  const a=clusters[from].pos.clone(),b=clusters[to].pos.clone();const mid=a.clone().add(b).multiplyScalar(.5);mid.add(new T.Vector3(0,0,rnd(4,10)));if(from&&to)mid.multiplyScalar(.6);
  const curve=new T.QuadraticBezierCurve3(a,mid,b);
  const trail=[];for(let k=0;k<10;k++){const t=new T.Sprite(pulseMat(color));t.material.opacity=.5*(1-k/10);t.scale.setScalar(1.6*(1-k/12));spin.add(t);trail.push(t)}
  pulses.push({s,trail,curve,t:0,to,from,sp:rnd(.45,.75)})}

/* ================================================================
   相机与交互
   ================================================================ */
const view={rx:0,ry:0,dist:MOBILE?150:118},goal={rx:0,ry:0,dist:view.dist};
let drag=null,moved=0;
canvas.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY};moved=0;stopPatrol()});
addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved+=Math.abs(dx)+Math.abs(dy);drag.x=e.clientX;drag.y=e.clientY;goal.ry+=dx*.005;goal.rx=Math.max(-1.2,Math.min(1.2,goal.rx+dy*.005))});
addEventListener("pointerup",e=>{if(drag&&moved<6)pick(e);drag=null});
canvas.addEventListener("wheel",e=>{e.preventDefault();goal.dist=Math.max(40,Math.min(260,goal.dist*(1+Math.sign(e.deltaY)*.08)))},{passive:false});
let pinch=0;canvas.addEventListener("touchmove",e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch)goal.dist=Math.max(40,Math.min(260,goal.dist*pinch/d));pinch=d;drag=null}},{passive:true});
canvas.addEventListener("touchend",()=>pinch=0);
const v3=new T.Vector3();
function screenOf(i){clusters[i].g.updateWorldMatrix(true,false);v3.setFromMatrixPosition(clusters[i].g.matrixWorld).project(cam);return {x:(v3.x+1)/2*innerWidth,y:(1-v3.y)/2*innerHeight,z:v3.z}}
function pick(e){if(!R)return;let best=-1,bd=1e9;clusters.forEach((c,i)=>{const p=screenOf(i);const d=Math.hypot(p.x-e.clientX,p.y-e.clientY);if(d<bd){bd=d;best=i}});
  const lim=Math.max(40,innerHeight*(best===0?.1:.065)*(118/view.dist));if(bd<lim)select(best);else select(-1)}
let tilt=false;
$("#rView").onclick=function(){tilt=!tilt;goal.rx=tilt?-.75:0;goal.ry=tilt?.55:0;this.textContent=tilt?"斜视":"正视"};

/* ---------- 选择 / 浮窗 / 抽屉 ---------- */
let sel=-1;
const marker=new T.Mesh(new T.RingGeometry(5.6,6,64),new T.MeshBasicMaterial({color:0x5fe3ff,transparent:true,opacity:0,side:T.DoubleSide}));spin.add(marker);
function info(i){return i===0?CENTER:AG[i-1]}
function select(i){sel=i;$$(".rtag").forEach((t,k)=>t.classList.toggle("on",k===i));
  const pop=$("#pop");if(i<0){pop.hidden=true;$("#rCur").textContent="总调度 · 待命";goal.dist=MOBILE?150:118;return}
  const a=info(i),st=ST[a.st];
  $("#popNo").textContent=a.code;$("#popNo").style.color=a.c;$("#popName").textContent=a.name+(i?" · 智能体":"");
  $("#popTime").textContent=`对应课程：${st.no} ${st.name} · ${st.min} 分钟`;$("#popDesc").textContent=a.desc;
  $("#popTasks").innerHTML=a.tasks.map(t=>`<span>${t}</span>`).join("");pop.hidden=false;pop.style.animation="none";pop.offsetHeight;pop.style.animation="";
  $("#rCur").textContent=a.name;marker.position.copy(clusters[i].pos);marker.scale.setScalar(i?1:1.9);marker.material.color.set(a.c);
  clusters[i].flash=1;if(i)send(0,i,a.c);feed(`${a.code} · ${a.name}`,"已选中，查看工作状态",a.c);
  goal.dist=MOBILE?120:96}
const drawer=$("#drawer"),dwBody=$("#dwBody"),lib=$("#library");let open=-1;
function revealCheck(){const H=innerHeight;dwBody.querySelectorAll(".rv:not(.in)").forEach(el=>{const r=el.getBoundingClientRect();if(r.top<H*.95&&r.bottom>0&&r.width){el.classList.add("in");el.dispatchEvent(new CustomEvent("reveal"))}})}
let rcT=0;dwBody.addEventListener("scroll",()=>{if(rcT)return;rcT=setTimeout(()=>{rcT=0;revealCheck()},120)},{passive:true});
function openSt(i){if(i<0||i>=ST.length)return;const m=ST[i];
  [...dwBody.children].forEach(c=>lib.appendChild(c));
  m.secs.forEach(id=>{const s=document.getElementById(id);if(s)dwBody.appendChild(s)});
  if(i===ST.length-1){const f=lib.querySelector(".lib-foot");if(f)dwBody.appendChild(f)}
  dwBody.scrollTop=0;setTimeout(revealCheck,650);
  $("#dwNo").textContent=m.no;$("#dwNo").style.color=m.c;$("#dwName").textContent=m.name;$("#dwTime").textContent=`${m.min} 分钟`;
  drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");open=i;$("#pop").hidden=true;
  visited[m.id]=1;store.set("visited",visited);renderST();stopPatrol()}
function closeDrawer(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");open=-1;if(sel>=0)$("#pop").hidden=false}
$("#popOpen").onclick=()=>{if(sel>=0)openSt(info(sel).st)};
$("#popClose").onclick=()=>select(-1);
$("#dwClose").onclick=closeDrawer;
$("#dwPrev").onclick=()=>openSt((open-1+ST.length)%ST.length);
$("#dwNext").onclick=()=>openSt((open+1)%ST.length);
document.addEventListener("click",e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute("href").slice(1);if(IDX[id]===undefined)return;e.preventDefault();openSt(IDX[id])});
document.addEventListener("keydown",e=>{if(/input|textarea/i.test(e.target.tagName))return;
  if(e.key==="Escape"){if(open>=0)closeDrawer();else select(-1);return}
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const n=e.key==="ArrowRight"?1:-1;if(open>=0)openSt((open+n+ST.length)%ST.length);else select(((sel<0?0:sel)+n+13)%13);return}
  if(e.key==="Enter"&&sel>=0&&open<0){openSt(info(sel).st);return}
  if(e.key==="f"||e.key==="F")full()});
function full(){if(!document.fullscreenElement)document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();else document.exitFullscreen()}
$("#rFull").onclick=full;
$("#rQR").onclick=e=>{e.stopPropagation();const q=$("#qrPop2");q.hidden=!q.hidden};
document.addEventListener("click",e=>{if(!e.target.closest("#qrPop2,#rQR"))$("#qrPop2").hidden=true});
let patrol=null,pk=0;
$("#rPatrol").onclick=()=>{if(patrol){stopPatrol();return}if(open>=0)closeDrawer();$("#rPatrol").classList.add("on");pk=sel<1?1:sel;select(pk);patrol=setInterval(()=>{pk=pk%12+1;select(pk)},5000)};
function stopPatrol(){if(!patrol)return;clearInterval(patrol);patrol=null;$("#rPatrol").classList.remove("on")}

/* ---------- HUD ---------- */
function renderST(){$("#rStations").innerHTML=ST.map((m,i)=>`<li data-i="${i}" class="${visited[m.id]?"done":""} ${i===open?"on":""}" style="--sc:${m.c}"><span class="sn">${m.no}</span><b>${m.name}</b><span class="ss">${visited[m.id]?"已学":"未学"}</span><span class="st">${m.min} 分钟</span></li>`).join("");
  $("#rCount").textContent=`${ST.filter(m=>visited[m.id]).length}/8`}
$("#rStations").addEventListener("click",e=>{const li=e.target.closest("li");if(li)openSt(+li.dataset.i)});renderST();
$("#rAgents").innerHTML=AG.map((a,i)=>`<div class="ra" data-i="${i+1}" style="--ac:${a.c}"><span>${a.name}</span><span class="bars">${"<i></i>".repeat(10)}</span><b id="ra${i}">90%</b></div>`).join("");
$("#rAgents").addEventListener("click",e=>{const r=e.target.closest(".ra");if(r){stopPatrol();select(+r.dataset.i)}});
const load=AG.map(()=>rnd(60,98));
$("#rHeat").innerHTML="<i></i>".repeat(16*9);const heat=$$("#rHeat i");
function feed(who,msg,c){const d=new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Shanghai",hour12:false}));const el=document.createElement("div");el.innerHTML=`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} <b style="--fc:${c}">${who}</b> ${msg}`;const f=$("#rFeed");f.appendChild(el);while(f.children.length>26)f.firstChild.remove()}
// 标签
const tagBox=$("#rtags");
[CENTER,...AG].forEach((a,i)=>{const d=document.createElement("div");d.className="rtag"+(i?"":" center");d.style.setProperty("--tc",a.c);d.innerHTML=`<em>${a.code}</em><b>${a.name}</b><i>${i?"→ "+ST[a.st].name:"派单 · 汇总 · 人工复核"}</i>`;d.onclick=()=>{stopPatrol();sel===i?openSt(a.st):select(i)};tagBox.appendChild(d)});
const tags=$$(".rtag");
// 自动派单
let tasks=1286,blocks=37;
function dispatch(){if(document.hidden||!R)return;const to=1+Math.floor(Math.random()*12),a=AG[to-1];
  if(Math.random()<.55){send(0,to,a.c);feed("CORE → "+a.code,"派单："+MSG[a.code][Math.floor(Math.random()*MSG[a.code].length)],a.c)}
  else{let to2=1+Math.floor(Math.random()*12);if(to2===to)to2=to%12+1;send(to,to2,a.c);feed(a.code+" → "+AG[to2-1].code,"任务交接",a.c)}
  if(a.code==="RISK"){blocks++;$("#sBlock").textContent=blocks}
  tasks+=Math.floor(rnd(1,4));$("#sTask").textContent=tasks.toLocaleString()}
setInterval(dispatch,REDUCE?4000:900);
// 波形
const wv=$("#rWave"),wg=wv.getContext("2d");let wt=0;
function wave(){wg.clearRect(0,0,320,40);wg.strokeStyle="#5fe3ff";wg.lineWidth=1.4;wg.beginPath();for(let x=0;x<320;x++){const y=20+Math.sin(x*.08+wt)*6*Math.sin(x*.013+wt*.3)+Math.sin(x*.31+wt*2)*3*Math.random();x?wg.lineTo(x,y):wg.moveTo(x,y)}wg.stroke();wt+=.15}
function tick(){const d=new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Shanghai",hour12:false}));$("#rClock").textContent=`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  load.forEach((v,i)=>{load[i]=Math.max(55,Math.min(99,v+rnd(-3,3)));const el=document.getElementById("ra"+i);el.textContent=load[i].toFixed(0)+"%";const on=Math.round(load[i]/10);el.previousElementSibling.querySelectorAll("i").forEach((b,k)=>b.classList.toggle("on",k<on))});
  heat.forEach(h=>h.style.opacity=Math.random()<.35?rnd(.15,.95):.08);$("#sTok").textContent=(55+Math.random()*12).toFixed(1)+"K"}
setInterval(tick,1000);tick();

/* ---------- 开始 ---------- */
let started=false;
$("#startBtn").onclick=()=>{$("#start").classList.add("hide");started=true;view.dist=320;view.rx=-.9;view.ry=.8;goal.rx=0;goal.ry=0;feed("CORE","星环点亮，12 个岗位智能体上线","#fff");setTimeout(()=>toast("点击任意一团光，看这个岗位智能体在做什么"),2200)};

/* ---------- 主循环 ---------- */
function resize(){if(!R)return;R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener("resize",resize);resize();
let last=performance.now(),t=0,frame=0;
function loop(now){requestAnimationFrame(loop);if(!R)return;const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;frame++;
  if(document.hidden)return;if(open>=0&&(MOBILE||frame%3))return;
  if(!REDUCE)t+=dt;
  wave();
  const k=Math.min(1,dt*(started?2.2:4));view.rx+=(goal.rx-view.rx)*k;view.ry+=(goal.ry-view.ry)*k;view.dist+=(goal.dist-view.dist)*k*.8;
  world.rotation.set(view.rx,view.ry,0);
  const off=(!MOBILE&&innerWidth>1100)?-2:0;cam.position.set(off,0,view.dist);cam.lookAt(off,0,0);
  if(!REDUCE){spin.rotation.z+=dt*.025;ringG.rotation.z-=dt*.04;if(ringG.userData.dash)ringG.userData.dash.rotation.z+=dt*.12}
  // 刻度条跳动
  const U=ringG.userData;if(U&&U.inst&&frame%3===0){for(let i=0;i<U.N;i++){if(Math.random()<.12){const a=i/U.N*Math.PI*2;const L=Math.max(1.2,U.lens[i]+rnd(-1.6,1.6));U.lens[i]=Math.min(5.4,L);U.o.position.set(Math.cos(a)*(U.R0+L/2),Math.sin(a)*(U.R0+L/2),0);U.o.rotation.set(0,0,a);U.o.scale.set(L,.62,1);U.o.updateMatrix();U.inst.setMatrixAt(i,U.o.matrix)}}U.inst.instanceMatrix.needsUpdate=true}
  // 光团呼吸与闪烁
  clusters.forEach((c,i)=>{c.flash=Math.max(0,c.flash-dt*1.4);const b=1+Math.sin(t*1.3+i)*.04;c.g.scale.setScalar(b+c.flash*.18);c.mat.size=c.base*(1+c.flash*.9);c.mat.opacity=.8+c.flash*.2;c.lm.opacity=.38+c.flash*.5;c.core.material.opacity=.55+c.flash*.45+(i?0:.2);c.g.rotation.z+=dt*(i%2?.05:-.04)});
  // 选择标记
  marker.material.opacity+=((sel>=0?.9:0)-marker.material.opacity)*.15;marker.rotation.z+=dt;
  // 光点
  for(let p=pulses.length-1;p>=0;p--){const q=pulses[p];q.t+=dt*q.sp;const tt=Math.min(1,q.t);q.s.position.copy(q.curve.getPointAt(tt));
    q.trail.forEach((s,k)=>{s.position.copy(q.curve.getPointAt(Math.max(0,tt-k*.022)))});
    if(q.t>=1){clusters[q.to].flash=1;spin.remove(q.s);q.trail.forEach(s=>spin.remove(s));pulses.splice(p,1)}}
  R.render(scene,cam);
  // 标签
  const W=innerWidth,H=innerHeight;
  tags.forEach((el,i)=>{const p=screenOf(i);const vis=p.z<1&&p.x>-50&&p.x<W+50&&p.y>-30&&p.y<H+30;el.style.opacity=vis?1:0;
    const dx=i?(clusters[i].pos.x>=0?1:-1):0;const sc=Math.max(.75,Math.min(1.1,118/view.dist));
    el.style.transform=`translate(${p.x+(i?dx*(30*sc)+(dx<0?-el.offsetWidth:0):-el.offsetWidth/2)}px,${p.y-(i?14:H*.17*sc)}px)`})}
requestAnimationFrame(loop);
window.__ring={select,openSt,snap(){view.rx=goal.rx;view.ry=goal.ry;view.dist=goal.dist}};
})();
