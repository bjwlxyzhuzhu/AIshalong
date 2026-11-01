/* NexAI 政法版 · three.js 三维配图 */
(function(){
"use strict";
if(!window.THREE)return;
const T=THREE;
const REDUCE=matchMedia("(prefers-reduced-motion: reduce)").matches;
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ---------- 通用舞台：懒加载、离屏暂停、自适应、三维标签、拖动旋转 ---------- */
function stage(host,build,opt={}){
  let started=false;
  const io=new IntersectionObserver(es=>{
    const vis=es[0].isIntersecting;
    if(vis&&!started){started=true;start()}
    if(started)ctx.visible=vis;
  },{rootMargin:"150px"});
  io.observe(host);
  const ctx={visible:false,labels:[],host,fr:0};
  function start(){
    const canvas=opt.canvas||document.createElement("canvas");if(!opt.canvas)host.prepend(canvas);
    let r;try{r=new T.WebGLRenderer({canvas,antialias:true,alpha:true})}catch(e){host.classList.add("no3d");return}
    r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
    const scene=new T.Scene();const cam=new T.PerspectiveCamera(opt.fov||40,1,.1,200);
    Object.assign(ctx,{r,scene,cam,canvas});
    const api=build(ctx)||{};
    function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();ctx.w=w;ctx.h=h;api.resize&&api.resize(w,h)}
    size();new ResizeObserver(size).observe(host);
    // 拖动
    if(api.drag){let down=false,x0=0,y0=0;
      canvas.style.cursor="grab";canvas.style.touchAction="pan-y";
      canvas.addEventListener("pointerdown",e=>{down=true;x0=e.clientX;y0=e.clientY;canvas.style.cursor="grabbing"});
      window.addEventListener("pointerup",()=>{down=false;canvas.style.cursor="grab"});
      window.addEventListener("pointermove",e=>{if(!down)return;api.drag.y+=(e.clientX-x0)*.008;api.drag.x=Math.max(-.6,Math.min(.6,api.drag.x+(e.clientY-y0)*.004));x0=e.clientX;y0=e.clientY})}
    const v=new T.Vector3();let last=performance.now(),t=0;
    function frame(now){
      requestAnimationFrame(frame);
      if(!ctx.visible&&t>0)return;
      const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;if(!REDUCE)t+=dt;else if(t===0)t=.001;
      api.update&&api.update(t,dt);
      r.render(scene,cam);
      for(const L of ctx.labels){L.obj.updateWorldMatrix(true,false);v.setFromMatrixPosition(L.obj.matrixWorld);if(L.off)v.add(L.off);v.project(cam);
        L.el.style.transform=`translate(${(v.x+1)/2*ctx.w}px,${(1-v.y)/2*ctx.h}px) translate(-50%,-50%)`;L.el.style.opacity=(v.z>1||L.hide)?0:1}
    }
    requestAnimationFrame(frame);
  }
  return ctx;
}
function label(ctx,obj,text,cls="",off){const el=document.createElement("div");el.className="lbl3d "+cls;el.innerHTML=text;ctx.host.appendChild(el);const L={el,obj,off:off?new T.Vector3(...off):null};ctx.labels.push(L);return L}
function lights(scene,hemi=1,dir=.8){scene.add(new T.HemisphereLight(0xdff1ff,0x6b8bb0,hemi));const d=new T.DirectionalLight(0xffffff,dir);d.position.set(5,9,7);scene.add(d);return d}
function textSprite(txt,{size=64,color="#0f2340",bg=null,pad=18}={}){
  const c=document.createElement("canvas"),g=c.getContext("2d");g.font=`700 ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
  const w=Math.ceil(g.measureText(txt).width)+pad*2,h=size+pad*2;c.width=w;c.height=h;
  g.font=`700 ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
  if(bg){g.fillStyle=bg;const rr=h/2;g.beginPath();g.moveTo(rr,0);g.arcTo(w,0,w,h,rr);g.arcTo(w,h,0,h,rr);g.arcTo(0,h,0,0,rr);g.arcTo(0,0,w,0,rr);g.fill()}
  g.fillStyle=color;g.textBaseline="middle";g.fillText(txt,pad,h/2+2);
  const tex=new T.CanvasTexture(c);const s=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));s.scale.set(w/h*.5,.5,1);return s}
function cloud(scale=1,op=1){
  const g=new T.Group();const m=new T.MeshLambertMaterial({color:0xffffff,emissive:0xcfe6fb,emissiveIntensity:.55,transparent:op<1,opacity:op});
  const n=5+Math.floor(Math.random()*4);
  for(let i=0;i<n;i++){const s=new T.Mesh(new T.SphereGeometry(rnd(.7,1.25),18,14),m);s.position.set((i-n/2)*rnd(.75,.95),rnd(-.1,.45)+(i%2?.2:0),rnd(-.4,.4));s.scale.y=.8;g.add(s)}
  g.scale.setScalar(scale);return g}

/* =====================================================================
   HERO：天空岛（悬浮小岛 + 瀑布 + 云海 + 蝴蝶）
   画框 1440×900，岛顶草地位于 y≈560，水平居中
   ===================================================================== */
(function(){
  const canvas=document.getElementById("island");if(!canvas)return;
  const host=canvas.parentNode;
  stage(host,ctx=>{
    if(window.__plate){return {}}
    const {scene,cam}=ctx;cam.fov=35;cam.position.set(0,0,20);cam.lookAt(0,0,0);
    lights(scene,1.05,.9);
    const TOP=-1.54; // 岛顶世界坐标（对应画框 y=560）
    const island=new T.Group();scene.add(island);
    // 草皮
    const grass=new T.Mesh(new T.CylinderGeometry(4.35,4.15,.42,48),new T.MeshLambertMaterial({color:0x5fc45a}));grass.position.y=TOP-.21;grass.scale.z=.55;island.add(grass);
    const grassTop=new T.Mesh(new T.CircleGeometry(4.35,48),new T.MeshLambertMaterial({color:0x79d468}));grassTop.rotation.x=-Math.PI/2;grassTop.position.y=TOP+.002;grassTop.scale.y=.55;island.add(grassTop);
    // 泥土层
    const dirt=new T.Mesh(new T.CylinderGeometry(4.15,3.7,.55,40),new T.MeshLambertMaterial({color:0x9b6b43}));dirt.position.y=TOP-.68;dirt.scale.z=.55;island.add(dirt);
    // 岩石倒锥（顶点扰动）
    const rg=new T.ConeGeometry(3.75,4.6,11,4);rg.rotateX(Math.PI);const pa=rg.attributes.position;
    for(let i=0;i<pa.count;i++){const y=pa.getY(i);if(y<2.2){pa.setX(i,pa.getX(i)*rnd(.86,1.12));pa.setZ(i,pa.getZ(i)*rnd(.86,1.12));pa.setY(i,y+rnd(-.12,.12))}}
    rg.computeVertexNormals();
    const rock=new T.Mesh(rg,new T.MeshLambertMaterial({color:0xa89382,flatShading:true}));rock.position.y=TOP-.95-2.3;rock.scale.z=.55;island.add(rock);
    const rock2=new T.Mesh(new T.ConeGeometry(1.6,2.2,7),new T.MeshLambertMaterial({color:0x6f6359,flatShading:true}));rock2.rotation.x=Math.PI;rock2.position.set(-1.1,TOP-4.6,.2);island.add(rock2);
    // 草丛（随风摆动）
    const tufts=[];const tm=new T.MeshLambertMaterial({color:0x4fae4a});
    for(let i=0;i<70;i++){const a=Math.random()*Math.PI*2,rr=rnd(3.5,4.3);const c=new T.Mesh(new T.ConeGeometry(.08,rnd(.3,.55),4),tm);c.position.set(Math.cos(a)*rr,TOP+.18,Math.sin(a)*rr*.55);c.userData.p=Math.random()*6;island.add(c);tufts.push(c)}
    // 两侧小树与花
    [[-3.7,.05],[3.55,-.05],[-3.0,-.75]].forEach(([x,z],i)=>{const t=new T.Group();
      const tr=new T.Mesh(new T.CylinderGeometry(.09,.13,.8,6),new T.MeshLambertMaterial({color:0x7a4e2d}));tr.position.y=.4;t.add(tr);
      const cn=new T.Mesh(new T.IcosahedronGeometry(i===2?.45:.62,0),new T.MeshLambertMaterial({color:i===1?0x3e9e4a:0x4bb35a,flatShading:true}));cn.position.y=1.05;t.add(cn);
      t.position.set(x,TOP,z);t.userData.p=i;island.add(t);tufts.push(t)});
    const fm=[0xf6f03b,0xffffff,0xff8fb1];
    for(let i=0;i<26;i++){const a=Math.random()*Math.PI*2,rr=rnd(3.3,4.2);const f=new T.Mesh(new T.SphereGeometry(.06,6,5),new T.MeshBasicMaterial({color:fm[i%3]}));f.position.set(Math.cos(a)*rr,TOP+.12,Math.sin(a)*rr*.55);island.add(f)}
    // 漂浮小石
    const pebbles=[];for(let i=0;i<5;i++){const m=new T.Mesh(new T.DodecahedronGeometry(rnd(.18,.38)),new T.MeshLambertMaterial({color:0x8a7a6c,flatShading:true}));m.position.set(rnd(-6,6),rnd(-5,-2.5),rnd(-1,1));if(Math.abs(m.position.x)<4.5)m.position.x+=Math.sign(m.position.x||1)*4;m.userData.p=Math.random()*6;m.userData.y=m.position.y;scene.add(m);pebbles.push(m)}

    // 瀑布：从岛下沿落入云海
    const WX=1.25,WZ=1.25,WTOP=TOP-.95,WBOT=-7.2;
    const wc=document.createElement("canvas");wc.width=64;wc.height=256;const wg=wc.getContext("2d");
    const gr=wg.createLinearGradient(0,0,64,0);gr.addColorStop(0,"rgba(190,230,255,0)");gr.addColorStop(.2,"rgba(220,242,255,.85)");gr.addColorStop(.8,"rgba(220,242,255,.85)");gr.addColorStop(1,"rgba(190,230,255,0)");
    wg.fillStyle=gr;wg.fillRect(0,0,64,256);wg.globalAlpha=.55;wg.fillStyle="#fff";for(let i=0;i<40;i++){wg.fillRect(rnd(8,56),rnd(0,256),rnd(1,3),rnd(20,60))}
    const wt=new T.CanvasTexture(wc);wt.wrapT=T.RepeatWrapping;wt.repeat.set(1,2.5);
    const fall=new T.Mesh(new T.PlaneGeometry(1.1,WTOP-WBOT),new T.MeshBasicMaterial({map:wt,transparent:true,depthWrite:false}));fall.position.set(WX,(WTOP+WBOT)/2,WZ);scene.add(fall);
    const N=360,dp=new Float32Array(N*3),dv=new Float32Array(N);
    for(let i=0;i<N;i++){dp[i*3]=WX+rnd(-.55,.55);dp[i*3+1]=rnd(WBOT,WTOP);dp[i*3+2]=WZ+rnd(-.1,.2);dv[i]=rnd(3,5.5)}
    const dg=new T.BufferGeometry();dg.setAttribute("position",new T.BufferAttribute(dp,3));
    const drops=new T.Points(dg,new T.PointsMaterial({color:0xffffff,size:.07,transparent:true,opacity:.9,depthWrite:false}));scene.add(drops);

    // 云海：底边与两侧下角
    const clouds=[];
    const spots=[[-8.5,-5.6,1.2,1.5],[-5.2,-6.3,.6,1.3],[-1.8,-6.6,1.4,1.5],[1.6,-6.5,.8,1.45],[5,-6.4,1.1,1.5],[8.6,-5.5,.4,1.6],[-10.3,-3.9,0,1.25],[10.4,-3.7,.3,1.3],[-7,-4.6,-1.2,.9],[7.2,-4.5,-1,1],[0,-7.2,2.2,1.6],[-3.5,-5.4,-1.5,.8],[3.8,-5.3,-1.6,.85]];
    spots.forEach(([x,y,z,sc])=>{const c=cloud(sc);c.position.set(x,y,z);c.userData={x,p:Math.random()*6};scene.add(c);clouds.push(c)});
    // 高空薄云
    [[-11,5.2,-5,.65],[11.5,6.2,-6,.55]].forEach(([x,y,z,sc])=>{const c=cloud(sc,.85);c.position.set(x,y,z);c.userData={x,p:Math.random()*6,far:1};scene.add(c);clouds.push(c)});

    // 蝴蝶
    const flies=[];
    function butterfly(sz,col){const g=new T.Group();const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(.5,.5,1,.4,.9,-.1);shape.bezierCurveTo(.8,-.5,.3,-.4,0,0);
      const wg2=new T.ShapeGeometry(shape);const m=new T.MeshBasicMaterial({color:col,side:T.DoubleSide});
      const L=new T.Group(),R=new T.Group();const wl=new T.Mesh(wg2,m),wr=new T.Mesh(wg2,m);wr.scale.x=-1;L.add(wr);R.add(wl);g.add(L,R);
      const body=new T.Mesh(new T.CylinderGeometry(.04,.04,.5,5),new T.MeshBasicMaterial({color:0x5a4a1a}));body.rotation.z=.2;g.add(body);
      g.scale.setScalar(sz);g.userData={L,R};return g}
    for(let i=0;i<7;i++){const big=i===0;const b=butterfly(big?.55:rnd(.18,.26),big?0xffd23b:0xfff06a);
      b.userData.path={ax:rnd(6,10),ay:rnd(.8,2.2),cy:rnd(.6,4.2),sp:rnd(.05,.11)*(Math.random()<.5?-1:1),ph:Math.random()*6,z:rnd(-1,2)};if(big)Object.assign(b.userData.path,{ax:11,ay:1.4,cy:2.8,sp:.06,z:3});
      scene.add(b);flies.push(b)}

    return {update(t,dt){
      wt.offset.y=-t*1.6;
      for(let i=0;i<N;i++){dp[i*3+1]-=dv[i]*dt;dp[i*3]+=Math.sin(t*3+i)*.002;if(dp[i*3+1]<WBOT){dp[i*3+1]=WTOP;dp[i*3]=WX+rnd(-.38,.38)}}
      dg.attributes.position.needsUpdate=true;
      tufts.forEach(c=>c.rotation.z=Math.sin(t*1.6+c.userData.p)*.12);
      clouds.forEach(c=>{c.position.x=c.userData.x+Math.sin(t*.12+c.userData.p)*(c.userData.far?1.2:.55);c.position.y+=Math.sin(t*.4+c.userData.p)*.0008});
      pebbles.forEach(m=>{m.position.y=m.userData.y+Math.sin(t*.8+m.userData.p)*.18;m.rotation.y+=dt*.3});
      flies.forEach(b=>{const p=b.userData.path;const a=t*p.sp*6+p.ph;b.position.set(Math.sin(a)*p.ax,p.cy+Math.sin(a*2.3)*p.ay,p.z);
        const f=Math.sin(t*(b.scale.x>.4?9:16)+p.ph)*1.1;b.userData.L.rotation.y=f;b.userData.R.rotation.y=-f;b.rotation.z=Math.cos(a)*.3;b.rotation.y=Math.cos(a)*Math.sign(p.sp)>0?-.4:.4});
    },resize(){cam.aspect=1440/900;cam.updateProjectionMatrix()}};
  },{canvas,fov:35});
})();

/* =====================================================================
   第一讲：大模型 —— 三维神经网络 + 词元环绕
   ===================================================================== */
function sceneBrain(host){
  stage(host,ctx=>{
    const {scene,cam}=ctx;cam.position.set(0,0,10.5);lights(scene);
    const G=new T.Group();scene.add(G);
    const n=150,R=3.1,pts=[];
    for(let i=0;i<n;i++){const y=1-(i/(n-1))*2,r=Math.sqrt(1-y*y),th=i*2.399963;pts.push(new T.Vector3(Math.cos(th)*r*R,y*R,Math.sin(th)*r*R).multiplyScalar(rnd(.82,1.08)))}
    const inst=new T.InstancedMesh(new T.SphereGeometry(.075,10,8),new T.MeshLambertMaterial({color:0x1d6fb8}),n);
    const m4=new T.Matrix4();pts.forEach((p,i)=>{m4.makeTranslation(p.x,p.y,p.z);inst.setMatrixAt(i,m4)});G.add(inst);
    const edges=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(pts[i].distanceTo(pts[j])<1.05)edges.push([i,j]);
    const lp=new Float32Array(edges.length*6);edges.forEach(([a,b],k)=>{lp.set([pts[a].x,pts[a].y,pts[a].z,pts[b].x,pts[b].y,pts[b].z],k*6)});
    const lg=new T.BufferGeometry();lg.setAttribute("position",new T.BufferAttribute(lp,3));
    G.add(new T.LineSegments(lg,new T.LineBasicMaterial({color:0x49a9f3,transparent:true,opacity:.45})));
    const core=new T.Mesh(new T.IcosahedronGeometry(.9,1),new T.MeshLambertMaterial({color:0xf6f03b,emissive:0xb8a800,emissiveIntensity:.35,flatShading:true}));G.add(core);
    const cs=textSprite("大模型",{size:56,color:"#161c08"});cs.scale.multiplyScalar(1.3);cs.position.set(0,0,1.0);G.add(cs);
    // 信号脉冲
    const pulses=[];const pm=new T.MeshBasicMaterial({color:0xf6c400});
    for(let i=0;i<40;i++){const s=new T.Mesh(new T.SphereGeometry(.07,8,6),pm);s.userData={e:edges[Math.floor(Math.random()*edges.length)],t:Math.random()};G.add(s);pulses.push(s)}
    // 词元环绕
    const words=["合规","客户","风控","理财","信贷","服务","安全","数据","授信","网点","规范","报表"];const ring=new T.Group();scene.add(ring);
    words.forEach((w,i)=>{const s=textSprite(w,{size:52,color:"#0f2340",bg:"rgba(255,255,255,.92)",pad:16});const a=i/words.length*Math.PI*2;s.position.set(Math.cos(a)*4.6,Math.sin(a*2)*.6,Math.sin(a)*4.6);ring.add(s)});
    const drag={x:.2,y:0};
    return {drag,update(t,dt){G.rotation.y=t*.18+drag.y;G.rotation.x=drag.x;ring.rotation.y=-t*.25+drag.y;ring.rotation.x=drag.x*.6;core.rotation.y=t*.6;core.scale.setScalar(1+Math.sin(t*3)*.05);
      pulses.forEach(s=>{s.userData.t+=dt*.9;if(s.userData.t>1){s.userData.t=0;s.userData.e=edges[Math.floor(Math.random()*edges.length)]}const [a,b]=s.userData.e;s.position.lerpVectors(pts[a],pts[b],s.userData.t)})}};
  });
}

/* =====================================================================
   第二讲：内网 / 外网 —— 隔离墙拦截信息流
   ===================================================================== */
function sceneFirewall(host){
  stage(host,ctx=>{
    const {scene,cam}=ctx;cam.position.set(0,3.2,11.5);cam.lookAt(0,0,0);lights(scene,.9,.7);
    const base=(x,c)=>{const p=new T.Mesh(new T.CylinderGeometry(3.4,3.6,.25,40),new T.MeshLambertMaterial({color:c,transparent:true,opacity:.55}));p.position.set(x,-1.6,0);scene.add(p);
      const ring=new T.Mesh(new T.TorusGeometry(3.5,.03,6,80),new T.MeshBasicMaterial({color:c}));ring.rotation.x=Math.PI/2;ring.position.set(x,-1.45,0);scene.add(ring);return p};
    const L=base(-4.4,0x2fa36f),Rb=base(4.4,0x2f8fdc);
    // 内网：服务器机柜
    const racks=[];[[-5.6,-.8],[-4.2,.6],[-3.1,-.9],[-5.0,1.4]].forEach(([x,z],i)=>{const g=new T.Group();
      const b=new T.Mesh(new T.BoxGeometry(.9,1.8,.9),new T.MeshLambertMaterial({color:0x17345e}));g.add(b);
      for(let k=0;k<4;k++){const led=new T.Mesh(new T.BoxGeometry(.6,.06,.02),new T.MeshBasicMaterial({color:0x41e09a}));led.position.set(0,.6-k*.35,.46);g.add(led)}
      const e=new T.LineSegments(new T.EdgesGeometry(b.geometry),new T.LineBasicMaterial({color:0x41e09a}));g.add(e);
      g.position.set(x,-.55,z);scene.add(g);racks.push(g)});
    // 公网：AI 服务球
    const orbs=[];[[3.4,-.4,.8],[5.4,.2,-.6],[4.6,1.3,1.2],[3.6,1.0,-1.2]].forEach(([x,y,z],i)=>{const o=new T.Mesh(new T.SphereGeometry(.5,24,18),new T.MeshLambertMaterial({color:0x49a9f3,emissive:0x1d6fb8,emissiveIntensity:.5}));o.position.set(x,y,z);o.userData={y,p:i};scene.add(o);orbs.push(o);
      const halo=new T.Mesh(new T.TorusGeometry(.75,.02,6,40),new T.MeshBasicMaterial({color:0x9ad6f6}));o.add(halo);o.userData.h=halo});
    // 隔离墙
    const wall=new T.Group();scene.add(wall);
    const wm=new T.Mesh(new T.BoxGeometry(.18,4.6,6.4),new T.MeshBasicMaterial({color:0xe0574f,transparent:true,opacity:.28,depthWrite:false}));wall.add(wm);
    const grid=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.2,4.6,6.4,1,8,10)),new T.LineBasicMaterial({color:0xff7a70}));wall.add(grid);
    for(let i=1;i<10;i++){const l=new T.Mesh(new T.BoxGeometry(.21,4.6,.015),new T.MeshBasicMaterial({color:0xff7a70,transparent:true,opacity:.6}));l.position.z=-3.2+i*.64;wall.add(l)}
    for(let i=1;i<8;i++){const l=new T.Mesh(new T.BoxGeometry(.21,.015,6.4),new T.MeshBasicMaterial({color:0xff7a70,transparent:true,opacity:.6}));l.position.y=-2.3+i*.575;wall.add(l)}
    wall.position.y=.5;
    // 数据包
    const pk=[];const flashes=[];
    for(let i=0;i<22;i++){const m=new T.Mesh(new T.OctahedronGeometry(.2),new T.MeshBasicMaterial({color:i%3?0xf6f03b:0x9ad6f6}));reset(m,true);scene.add(m);pk.push(m)}
    function reset(m,init){const o=orbs[Math.floor(Math.random()*orbs.length)];m.position.copy(o.position);m.userData={v:new T.Vector3(-rnd(1.6,2.6),rnd(-.25,.3),rnd(-.4,.4)),bounce:false,life:init?-Math.random()*3:0};m.visible=!init}
    for(let i=0;i<10;i++){const f=new T.Mesh(new T.RingGeometry(.05,.18,24),new T.MeshBasicMaterial({color:0xff7a70,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));f.rotation.y=Math.PI/2;scene.add(f);flashes.push(f)}
    let fi=0;
    label(ctx,L,"行内网络 / 业务系统","g",[0,3.9,0]);label(ctx,Rb,"互联网 / 公共 AI 服务","b",[0,3.9,0]);label(ctx,wall,"客户数据不出行","r",[0,2.75,0]);
    const drag={x:0,y:0};
    return {drag,update(t,dt){
      scene.rotation.y=Math.sin(t*.25)*.18+drag.y*.5;
      racks.forEach((g,i)=>g.children.forEach((c,k)=>{if(k>0&&k<5)c.material.color.setHSL(.42,.7,.45+.15*Math.sin(t*4+i+k))}));
      orbs.forEach(o=>{o.position.y=o.userData.y+Math.sin(t*1.4+o.userData.p)*.18;o.userData.h.rotation.x=t;o.userData.h.rotation.y=t*.7});
      wm.material.opacity=.24+Math.sin(t*2)*.05;
      pk.forEach(m=>{const u=m.userData;u.life+=dt;if(u.life<0)return;if(!m.visible){reset(m);m.visible=true}
        m.position.addScaledVector(u.v,dt);m.rotation.x+=dt*4;m.rotation.y+=dt*3;
        if(!u.bounce&&m.position.x<.25){u.bounce=true;u.v.x=Math.abs(u.v.x)*.6;u.v.y=rnd(-.6,.6);const f=flashes[fi++%flashes.length];f.position.set(.12,m.position.y,m.position.z);f.scale.setScalar(1);f.material.opacity=1}
        if(u.bounce&&(m.position.x>3||u.life>6)){reset(m)}});
      flashes.forEach(f=>{if(f.material.opacity>0){f.material.opacity-=dt*1.6;f.scale.multiplyScalar(1+dt*3)}});
    }};
  });
}

/* =====================================================================
   第三讲：民警 ⇄ AI 陪练 —— 双球对话流
   ===================================================================== */
function sceneDialogue(host){
  stage(host,ctx=>{
    const {scene,cam}=ctx;cam.position.set(0,0,9);lights(scene);
    const mk=(x,c,e)=>{const g=new T.Mesh(new T.SphereGeometry(.9,32,24),new T.MeshLambertMaterial({color:c,emissive:e,emissiveIntensity:.35}));g.position.x=x;scene.add(g);
      const r=new T.Mesh(new T.TorusGeometry(1.25,.025,6,60),new T.MeshBasicMaterial({color:c}));g.add(r);g.userData.r=r;return g};
    const A=mk(-3.4,0xf6f03b,0x9a8f00),B=mk(3.4,0x49a9f3,0x1d6fb8);
    label(ctx,A,"客户经理（学员）","y",[0,-1.55,0]);label(ctx,B,"AI 客户","b",[0,-1.55,0]);
    const N=60,ps=[];for(let i=0;i<N;i++){const m=new T.Mesh(new T.SphereGeometry(.1,8,6),new T.MeshBasicMaterial({color:0xffffff}));m.visible=false;scene.add(m);ps.push(m)}
    const lines=["您的理财下周到期","我还没想好……","这笔钱近期要用吗？","孩子明年上学"];
    const bub=label(ctx,A,"","",[0,1.6,0]);
    return {update(t){
      const cyc=t%4,dir=Math.floor(t/4)%2;const from=dir?B:A,to=dir?A:B;
      bub.obj=from;bub.el.className="lbl3d "+(dir?"b":"y");bub.el.textContent=lines[Math.floor(t/4)%lines.length];bub.el.style.display=cyc<2.6?"":"none";
      ps.forEach((m,i)=>{const k=(cyc*0.55-i*.012);if(k<0||k>1){m.visible=false;return}m.visible=true;
        const x=T.MathUtils.lerp(from.position.x,to.position.x,k);m.position.set(x,Math.sin(k*Math.PI)*1.6+Math.sin(i*1.3+t*4)*.12,Math.cos(i*.7+t*3)*.15);m.material.color.set(dir?0x1d6fb8:0xe0a800)});
      [A,B].forEach((s,j)=>{const hit=(j===(dir?0:1))&&cyc>1.6&&cyc<2.4;s.scale.setScalar(hit?1.12:1);s.userData.r.rotation.x=t*(j?1:-1);s.userData.r.rotation.y=t*.6})}};
  });
}

/* =====================================================================
   休息：云朵与光点
   ===================================================================== */
function sceneSky(host){
  stage(host,ctx=>{
    const {scene,cam}=ctx;cam.position.set(0,0,14);lights(scene,1.1,.6);
    const cs=[];for(let i=0;i<9;i++){const c=cloud(rnd(.35,.7),.7);c.position.set(rnd(-16,16),rnd(-7,7),rnd(-10,-4));c.userData.v=rnd(.25,.6);scene.add(c);cs.push(c)}
    const N=160,p=new Float32Array(N*3);for(let i=0;i<N;i++)p.set([rnd(-14,14),rnd(-8,8),rnd(-4,3)],i*3);
    const g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(p,3));const pts=new T.Points(g,new T.PointsMaterial({color:0xfff7a0,size:.09,transparent:true,opacity:.85}));scene.add(pts);
    return {update(t,dt){cs.forEach(c=>{c.position.x+=c.userData.v*dt;if(c.position.x>16)c.position.x=-16});pts.rotation.z=t*.02;pts.material.opacity=.6+Math.sin(t*2)*.25}};
  });
}

/* =====================================================================
   第四讲：智能体组装 —— 四模块沿工作流轨道汇入核心
   ===================================================================== */
function sceneAgent(host){
  stage(host,ctx=>{
    const {scene,cam}=ctx;cam.position.set(0,3.4,10.5);cam.lookAt(0,-.2,0);lights(scene);
    const core=new T.Group();scene.add(core);
    const coreM=new T.Mesh(new T.IcosahedronGeometry(1.05,1),new T.MeshLambertMaterial({color:0xf6f03b,emissive:0xa69a00,emissiveIntensity:.3,flatShading:true}));core.add(coreM);
    const coreW=new T.LineSegments(new T.EdgesGeometry(new T.IcosahedronGeometry(1.45,1)),new T.LineBasicMaterial({color:0x161c08,transparent:true,opacity:.35}));core.add(coreW);
    const orbit=new T.Mesh(new T.TorusGeometry(3.6,.035,8,120),new T.MeshBasicMaterial({color:0x3195e0}));orbit.rotation.x=Math.PI/2;scene.add(orbit);
    const dots=[];for(let i=0;i<36;i++){const d=new T.Mesh(new T.SphereGeometry(.045,6,5),new T.MeshBasicMaterial({color:0x3195e0}));scene.add(d);dots.push(d)}
    const names=[["大模型",0x2f8fdc],["角色设定",0x6a5cff],["知识库",0x2fa36f],["工具",0xf0532e]];
    const mods=names.map(([n,c],i)=>{const g=new T.Group();const b=new T.Mesh(new T.BoxGeometry(.9,.9,.9),new T.MeshLambertMaterial({color:c}));g.add(b);
      g.add(new T.LineSegments(new T.EdgesGeometry(b.geometry),new T.LineBasicMaterial({color:0xffffff})));scene.add(g);g.userData.a=i/4*Math.PI*2;label(ctx,g,n,"",[0,.95,0]);return g});
    const coreL=label(ctx,core,"智能体","y",[0,2.0,0]);
    label(ctx,orbit,"工作流：先做什么，再做什么","b",[0,-.55,3.6]);
    const tmp=new T.Vector3();
    return {update(t,dt){
      const cyc=t%9; // 0-4 环绕；4-6.5 汇入；6.5-9 合体
      const merge=T.MathUtils.smoothstep(cyc,4,6.2);
      mods.forEach((g,i)=>{const a=g.userData.a+t*.5;tmp.set(Math.cos(a)*3.6,0,Math.sin(a)*3.6);
        const k=T.MathUtils.clamp(merge*1.25-i*.08,0,1);g.position.lerpVectors(tmp,new T.Vector3(0,0,0),k);g.scale.setScalar(1-k*.7);g.rotation.x+=dt;g.rotation.y+=dt*.7});
      dots.forEach((d,i)=>{const a=i/36*Math.PI*2-t*.9;d.position.set(Math.cos(a)*3.6,0,Math.sin(a)*3.6)});
      const glow=T.MathUtils.smoothstep(cyc,5.6,6.6)*(1-T.MathUtils.smoothstep(cyc,8.4,9));
      coreM.scale.setScalar(1+glow*.35+Math.sin(t*3)*.03);coreM.material.emissiveIntensity=.3+glow*.8;coreW.rotation.y=-t*.4;coreW.rotation.x=t*.2;coreM.rotation.y=t*.5;
      coreL.el.textContent=glow>.5?"智能体：按流程把事办完 ✓":"智能体";
    }};
  });
}

/* =====================================================================
   第五讲：分镜胶片环
   ===================================================================== */
function sceneFilm(host){
  stage(host,ctx=>{
    const {scene,cam}=ctx;cam.position.set(0,2.4,10.5);cam.lookAt(0,-.2,0);lights(scene,1,.6);
    const ring=new T.Group();scene.add(ring);
    const shots=["入职第一天","AI 新同事","三不传","先脱敏","人在回路","守规矩"];
    const R=4.2;
    shots.forEach((s,i)=>{const a=i/shots.length*Math.PI*2;const g=new T.Group();
      const back=new T.Mesh(new T.PlaneGeometry(2.6,1.95),new T.MeshBasicMaterial({color:0x111111,side:T.DoubleSide}));g.add(back);
      for(let k=0;k<7;k++)[.86,-.86].forEach(y=>{const h=new T.Mesh(new T.PlaneGeometry(.16,.1),new T.MeshBasicMaterial({color:0xe8e8e8}));h.position.set(-1.1+k*.37,y,.002);g.add(h)});
      const c=document.createElement("canvas");c.width=480;c.height=270;const tex=new T.CanvasTexture(c);
      const img=new Image();const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 160 90">${(window.scene?window.scene(i,160,90):"")}</svg>`;
      img.onload=()=>{const g2=c.getContext("2d");g2.drawImage(img,0,0,480,270);g2.fillStyle="rgba(0,0,0,.55)";g2.fillRect(0,226,480,44);g2.fillStyle="#f6f03b";g2.font='700 24px "PingFang SC","Microsoft YaHei",sans-serif';g2.fillText(`镜 ${i+1} · ${s}`,16,256);tex.needsUpdate=true};
      img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
      const pic=new T.Mesh(new T.PlaneGeometry(2.4,1.35),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));pic.position.z=.004;g.add(pic);const pic2=pic.clone();pic2.position.z=-.004;pic2.rotation.y=Math.PI;g.add(pic2);
      g.position.set(Math.sin(a)*R,0,Math.cos(a)*R);g.rotation.y=a;ring.add(g)});
    const floor=new T.Mesh(new T.CircleGeometry(5.5,60),new T.MeshBasicMaterial({color:0x1d3c66,transparent:true,opacity:.5}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.4;scene.add(floor);
    const drag={x:0,y:0};
    return {drag,update(t){ring.rotation.y=t*.22+drag.y;ring.position.y=Math.sin(t)*.06}};
  });
}

/* =====================================================================
   结语：人在回路 —— 光点沿闭环运行
   ===================================================================== */
function sceneLoop(host){
  stage(host,ctx=>{
    const {scene,cam}=ctx;cam.position.set(0,5.2,8.6);cam.lookAt(0,-.3,0);lights(scene,1,.7);
    const R=3.3;
    const ring=new T.Mesh(new T.TorusGeometry(R,.06,10,140),new T.MeshBasicMaterial({color:0x3a6aa8}));ring.rotation.x=Math.PI/2;scene.add(ring);
    const nodes=[["AI 起草","生成初稿、发出提示",0x49a9f3,"b"],["员工判断","核实、审批、签字",0xf6f03b,"y"],["制度兜底","合规、审计、问责",0x2fa36f,"g"],["复盘改进","纠正误报、优化规则",0xa882ff,""]]
      .map(([n,d,c,cls],i)=>{const a=-Math.PI/2+i*Math.PI/2;const m=new T.Mesh(new T.SphereGeometry(.42,24,18),new T.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:.25}));
        m.position.set(Math.cos(a)*R,0,Math.sin(a)*R);m.userData.a=a;scene.add(m);label(ctx,m,`${n}<br><span style="font-weight:400;font-size:12px">${d}</span>`,cls,[0,.95,0]);return m});
    const hub=new T.Mesh(new T.CylinderGeometry(1.1,1.1,.12,48),new T.MeshLambertMaterial({color:0x17345e}));scene.add(hub);label(ctx,hub,"人在回路","y",[0,.4,0]);
    nodes.forEach(n=>{const g=new T.BufferGeometry().setFromPoints([new T.Vector3(),n.position]);scene.add(new T.Line(g,new T.LineDashedMaterial({color:0x5a7fb5,dashSize:.15,gapSize:.12})).computeLineDistances())});
    const spark=new T.Mesh(new T.SphereGeometry(.16,16,12),new T.MeshBasicMaterial({color:0xffffff}));scene.add(spark);
    const pl=new T.PointLight(0xfff3a0,1.4,4);spark.add(pl);
    const trail=[];for(let i=0;i<24;i++){const s=new T.Mesh(new T.SphereGeometry(.09*(1-i/26),8,6),new T.MeshBasicMaterial({color:0xf6f03b,transparent:true,opacity:1-i/24}));scene.add(s);trail.push(s)}
    return {update(t){
      const a=-Math.PI/2+t*.75;spark.position.set(Math.cos(a)*R,0,Math.sin(a)*R);
      trail.forEach((s,i)=>{const b=a-i*.05;s.position.set(Math.cos(b)*R,0,Math.sin(b)*R)});
      nodes.forEach(n=>{let d=((a-n.userData.a)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);const k=Math.max(0,1-d/1.1);n.scale.setScalar(1+k*.45);n.material.emissiveIntensity=.25+k*.8});
      scene.rotation.y=Math.sin(t*.2)*.12;
    }};
  });
}

const MAP={brain:sceneBrain,firewall:sceneFirewall,dialogue:sceneDialogue,sky:sceneSky,agent:sceneAgent,film:sceneFilm,loop:sceneLoop};
document.querySelectorAll("[data-scene]").forEach(el=>{const f=MAP[el.dataset.scene];if(f)f(el)});
})();
