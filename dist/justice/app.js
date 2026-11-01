/* NexAI 政法版 · 交互脚本 */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem("nexai-j-"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("nexai-j-"+k,JSON.stringify(v))}catch(e){}}};
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),1800)}

/* ---------- 复制 ---------- */
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-copy]");if(!b)return;
  const src=document.getElementById(b.dataset.copy);if(!src)return;
  const txt=src.innerText.replace(/\n{3,}/g,"\n\n").trim();
  const done=()=>{b.classList.add("done");const o=b.textContent;b.textContent="已复制 ✓";setTimeout(()=>{b.classList.remove("done");b.textContent=o},1500)};
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(txt).then(done,()=>fallback(txt,done))}else fallback(txt,done);
});
function fallback(t,cb){const ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy");cb()}catch(e){toast("请长按手动复制")}ta.remove()}

/* ---------- 入场动效 ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);e.target.dispatchEvent(new CustomEvent("reveal"))}}),{threshold:.15});
function observe(el){io.observe(el)}
$$(".rv,.draw").forEach(observe);
$$(".draw path,.draw line").forEach(p=>{try{p.style.setProperty("--len",Math.ceil(p.getTotalLength?p.getTotalLength():1200))}catch(e){}});
function onView(el,fn){if(!el)return;const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){o.disconnect();fn()}},{threshold:.3});o.observe(el)}

/* ---------- 荧光笔笔刷 ---------- */
const SWIPE='<svg class="swipe" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true"><path d="M4 9 L12 5 L30 7 L52 3 L80 6 L108 2 L140 6 L168 3 L192 7 L197 14 L193 20 L198 27 L191 34 L170 37 L140 34 L110 38 L82 35 L54 38 L28 35 L10 37 L3 30 L7 23 L2 16 Z"/></svg>';
$$(".kicker").forEach(k=>k.classList.add("hl"));
$$(".hl").forEach(h=>{if(!h.querySelector(".swipe"))h.insertAdjacentHTML("afterbegin",SWIPE)});

/* ---------- 开篇：一天时间线 ---------- */
const DAY=[
  {t:"07:30",n:"早点名交班",i:"i-sun",can:"整理交班要点的格式模板；把自己的口头备忘（不含人员信息）转成条理清楚的清单。",cant:"在押人数、人员名单、交班中的具体狱情，一律不输入 AI。"},
  {t:"09:00",n:"监区巡查",i:"i-walk",can:"课后用 AI 学习巡查规范、安全隐患识别要点，生成自查清单。",cant:"监区内不带手机；巡查发现的情况、位置、照片，绝不上传。"},
  {t:"10:30",n:"个别谈话",i:"i-talk",can:"谈话前用脱敏后的情况设计提纲；和 AI 陪练员反复练习沟通方法。",cant:"不把真实姓名、案情、谈话内容发给 AI；风险信号立即按程序上报。"},
  {t:"14:00",n:"文书材料",i:"i-pen",can:"工作总结、宣传稿、会议纪要（非涉密）的提纲、润色、格式检查。",cant:"执法文书中的事实认定和定性不交给 AI；涉密文件不上传、不拍照。"},
  {t:"15:30",n:"教育授课",i:"i-graduate",can:"10 分钟生成法治教育微课的讲稿、配图、随堂测验。",cant:"不使用未公开的案件；课件内容须经审核后使用。"},
  {t:"17:00",n:"学习培训",i:"i-book",can:"法规学习、考试刷题、错题整理；让 AI 当你的私人教练。",cant:"AI 给的法条要对照官方文本核实，不能直接当答案背。"},
  {t:"20:00",n:"夜间值班",i:"i-moon",can:"下班后用 AI 学习应急处置知识、做心理放松。",cant:"值班期间严守岗位纪律；监控画面、值班信息不外传。"}
];
(function(){
  const box=$("#day");box.innerHTML=DAY.map((d,i)=>`<div class="dn rv d${i%5}" data-i="${i}"><div class="dot"><svg><use href="#${d.i}"/></svg></div><div><div class="tm">${d.t}</div><div class="nm">${d.n}</div></div></div>`).join("");
  $$(".dn",box).forEach(observe);
  function pick(i){$$(".dn",box).forEach((n,k)=>n.classList.toggle("on",k===i));const d=DAY[i];$("#ddT1").textContent=d.n;$("#ddCan").textContent=d.can;$("#ddCant").textContent=d.cant}
  box.addEventListener("click",e=>{const n=e.target.closest(".dn");if(n)pick(+n.dataset.i)});pick(2);
})();

/* ---------- 投票 ---------- */
(function(){
  const opts=["写总结、汇报等材料","整理会议和学习笔记","法规学习与考试备考","个别谈话前的准备","制作教育课件","宣传短视频制作"];
  const box=$("#poll1");let mine=store.get("poll1",null);
  function render(){box.classList.toggle("voted",mine!=null);
    box.innerHTML=opts.map((o,i)=>`<button data-i="${i}" class="${mine===i?"mine":""}"><span class="bar" style="width:${mine===i?100:0}%"></span><span class="lb"><span>${String.fromCharCode(65+i)}. ${o}</span><span class="pc">${mine===i?"✓ 我的选择":""}</span></span></button>`).join("")+
      (mine!=null?`<p class="muted" style="font-size:13.5px">已记录。你可以随时点其他选项修改。</p>`:"")}
  box.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;mine=+b.dataset.i;store.set("poll1",mine);render();toast("投票成功")});render();
})();

/* ---------- 千问录音演示 ---------- */
(function(){
  const g=$("#qwWave");let bars="";for(let i=0;i<22;i++)bars+=`<rect x="${14+i*5.6}" y="120" width="3.4" height="10" rx="1.7"/>`;g.innerHTML=bars;
  const rects=$$("rect",g);let t=0,timer=null;
  const lines=["主讲人：同志们好，今天我们一起聊聊“与AI共事”。","主讲人：首先请记住一句话，AI 是助手，不是警察。","主讲人：我们先讲纪律，再讲用法……"];
  async function run(){
    if(timer)return;timer=setInterval(()=>{t++;$("#qwTime").textContent=`00:${String(t%60).padStart(2,"0")}`;rects.forEach(r=>{const h=6+Math.random()*44;r.setAttribute("height",h);r.setAttribute("y",125-h/2)})},120);
    const out=$("#qwText");
    while(true){out.textContent="";$("#qwSum").style.opacity=.25;
      for(const l of lines){for(let i=1;i<=l.length;i++){out.textContent=out.textContent.replace(/[^\n]*$/,"")+l.slice(0,i);await sleep(45)}out.textContent+="\n";await sleep(400)}
      $("#qwSum").style.opacity=1;await sleep(4500)}
  }
  $("#qwText").style.whiteSpace="pre-wrap";onView($("#qwText"),run);
})();

/* ---------- WorkBuddy 演示 ---------- */
(function(){
  const steps=["读取「岗前培训资料」文件夹，发现 23 个文件","识别每个文件的讲次和主题","新建 6 个子文件夹并归类文件","生成《岗前培训学习目录.docx》","完成。共整理 23 个文件，用时 1 分 12 秒（演示数据）"];
  const ol=$("#wbSteps");
  async function run(){while(true){ol.innerHTML="";for(let i=0;i<steps.length;i++){const li=document.createElement("li");li.style.cssText="display:flex;gap:10px;align-items:flex-start;padding:4px 0;animation:fadein .4s";
    li.innerHTML=`<span style="flex:none;width:20px;height:20px;border-radius:50%;border:2px solid #4fb3e8;border-top-color:transparent;animation:spin 1s linear infinite;margin-top:4px"></span><span>${steps[i]}</span>`;ol.appendChild(li);await sleep(1100);
    li.firstChild.style.cssText="flex:none;width:20px;height:20px;border-radius:50%;background:#41b883;color:#06101f;display:grid;place-items:center;font-size:12px;font-weight:900;margin-top:4px";li.firstChild.textContent="✓";
    if(i===steps.length-1)li.style.color="#7fe0b0"}await sleep(4000)}}
  onView(ol,run);
})();

/* ---------- 第一讲：猜下一个词 ---------- */
(function(){
  const BASE="监狱人民警察必须";
  const T={"BASE":[["严格",.64],["依法",.17],["忠于",.1],["认真",.06],["坚持",.03]],
    "严格":[["依法",.58],["遵守",.21],["执行",.12],["落实",.06],["要求",.03]],
    "依法":[["履行",.52],["办事",.21],["管理",.15],["执法",.09],["行使",.03]],
    "忠于":[["职守",.55],["法律",.25],["人民",.15],["使命",.05]],
    "认真":[["履行",.6],["学习",.25],["负责",.15]],
    "坚持":[["依法",.5],["原则",.3],["学习",.2]],
    "遵守":[["纪律",.5],["法律",.3],["规定",.2]],
    "执行":[["规定",.5],["制度",.3],["命令",.2]],
    "落实":[["制度",.6],["责任",.4]],
    "履行":[["职责",.81],["义务",.11],["职务",.05],["程序",.03]],
    "行使":[["职权",1]],"学习":[["法律",.6],["业务",.4]],"要求":[["自己",1]]};
  const END=[["。",.62],["，",.25],["；",.13]];
  let words=[],done=false;
  const sent=$("#ntSent"),probs=$("#ntProbs");
  function cur(){const last=words.length?words[words.length-1]:"BASE";return T[last]||END}
  function draw(hl){sent.innerHTML=esc(BASE)+words.map((w,i)=>i===words.length-1&&hl?`<span class="new">${esc(w)}</span>`:esc(w)).join("")+(done?"":'<span class="caret"></span>');
    const c=done?[]:cur();probs.innerHTML=c.map((p,i)=>`<div class="nt-row ${i===0?"top":""}"><span class="tk">${esc(p[0])}</span><span class="bg"><span class="fg" data-w="${p[1]*100}"></span></span><span class="pv">${Math.round(p[1]*100)}%</span></div>`).join("")||`<p style="color:var(--gold-2);font-size:17px">句子生成完毕。点"重来"，试试"随机采样"会得到什么。</p>`;
    requestAnimationFrame(()=>$$(".fg",probs).forEach(f=>f.style.width=f.dataset.w+"%"))}
  function step(rand){if(done)return;const c=cur();let w=c[0][0];
    if(rand){let r=Math.random()*c.reduce((s,p)=>s+Math.pow(p[1],.5),0);for(const p of c){r-=Math.pow(p[1],.5);if(r<=0){w=p[0];break}}}
    words.push(w);if(/[。，；]/.test(w)||words.length>=6){if(w==="，")words.push("……");done=true}draw(true)}
  $("#ntNext").onclick=()=>step(false);$("#ntRand").onclick=()=>step(true);$("#ntReset").onclick=()=>{words=[];done=false;draw()};draw();
})();

/* ---------- 能力成熟度 ---------- */
$$(".cap").forEach(c=>c.addEventListener("reveal",()=>{const lv=$(".lv",c),n=+lv.dataset.lv;$$("i",lv).forEach((i,k)=>setTimeout(()=>i.classList.toggle("on",k<n),300+k*180))}));

/* ---------- 工具地图 ---------- */
(function(){
  const tools=[["千问","问","#615ced","对话写作、手机录音纪要、电脑端语音输入"],["DeepSeek","D","#4d6bfe","深度思考、推理分析、长文理解"],["豆包","豆","#2f6bf6","日常对话、语音通话、图片生成"],
    ["Kimi","K","#1d1d1f","长文档阅读、资料检索与归纳"],["文心一言","文","#2932e1","对话写作、知识问答"],["腾讯元宝","元","#0bab73","对话、检索、文章总结"],
    ["WorkBuddy","W","#b8892a","桌面办公智能体、技能扩展、微信远程"],["即梦","即","#6a5cff","文生图、图生视频"],["可灵","可","#f0532e","AI 视频生成"],
    ["剪映","剪","#222831","剪辑、自动字幕、AI 配音"],["Claude","C","#c96a4a","写代码、做应用、长文档分析"],["Codex","X","#108a6c","编程智能体、网站与文件型任务"]];
  const box=$("#tools");box.innerHTML=tools.map((t,i)=>`<div class="tool rv d${i%4}" style="background:#fff;border-color:#e3dccb"><span class="lg" style="background:${t[2]}">${t[1]}</span><div><b>${t[0]}</b><p style="color:var(--paper-ink-2)">${t[3]}</p></div></div>`).join("");
  $$(".tool",box).forEach(observe);
})();

/* ---------- 提示词公式构建器 ---------- */
(function(){
  const F=[{k:1,n:"角色",o:["资深监狱政工干部","法律法规授课老师","心理健康科普老师","政工宣传干事"]},
    {k:2,n:"任务",o:["写一份岗前培训个人总结","设计一次个别谈话提纲","出 10 道法规练习题","写一条普法短视频脚本"]},
    {k:3,n:"背景",o:["我是新录用监狱警察，刚完成两周岗前培训","谈话对象近期家庭变故、情绪低落（已脱敏）","我在准备单位组织的法规考试","面向社会公众，宣传依法治监"]},
    {k:4,n:"要求",o:["语言朴实，少用套话","不超过 800 字","每题注明法规出处","通俗易懂，适合手机观看"]},
    {k:5,n:"格式",o:["分“收获—不足—打算”三部分","用表格呈现","选择题，附答案和解析","分镜头脚本：镜号/画面/台词"]}];
  const sel=F.map(()=>0);const box=$("#pbFields");
  box.innerHTML=F.map((f,i)=>`<div class="pb-field"><label>${f.k}. ${f.n}</label><div class="pb-chips" data-f="${i}">${f.o.map((o,j)=>`<button data-j="${j}" class="${j===0?"on":""}" style="${'color:var(--paper-ink);border-color:#cfc6b2'}">${o}</button>`).join("")}</div></div>`).join("");
  function out(){const v=F.map((f,i)=>f.o[sel[i]]);
    $("#pbOut").innerHTML=`你是一名<em class="k1">${esc(v[0])}</em>。\n请帮我<em class="k2">${esc(v[1])}</em>。\n\n背景：<em class="k3">${esc(v[2])}</em>。\n\n要求：<em class="k4">${esc(v[3])}</em>。\n\n输出格式：<em class="k5">${esc(v[4])}</em>。`;
    $$("#pbFields .pb-chips button").forEach(b=>{const on=b.classList.contains("on");b.style.color=on?"var(--navy-0)":"var(--paper-ink)";b.style.borderColor=on?"var(--gold)":"#cfc6b2"})}
  box.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const fi=+b.parentNode.dataset.f;sel[fi]=+b.dataset.j;$$("button",b.parentNode).forEach(x=>x.classList.toggle("on",x===b));
    $$("#formula .f").forEach(x=>x.classList.toggle("on",+x.dataset.k===F[fi].k));out()});out();
  let k=0;setInterval(()=>{if(document.hidden)return;k=k%5+1;$$("#formula .f").forEach(x=>x.classList.toggle("on",+x.dataset.k===k))},1600);
})();

/* ---------- 第二讲：脱敏 ---------- */
(function(){
  let doneOnce=false;
  $("#dsBtn").onclick=async()=>{const ss=$$("#dsRaw .sens");
    if(doneOnce){ss.forEach(s=>{s.textContent=s.dataset.o;s.className="sens"});$("#dsSafeText").style.opacity=.25;doneOnce=false;return}
    for(const s of ss){s.dataset.o=s.dataset.o||s.textContent;s.style.opacity=0;await sleep(220);s.textContent=s.dataset.m;s.className="mask";s.style.opacity=1}
    $("#dsSafeText").style.opacity=1;doneOnce=true;toast("脱敏完成：去姓名、去编号、去位置、去时间")};
})();

/* ---------- 第二讲：情景判断 ---------- */
(function(){
  const Q=[
    {q:"培训讲座（非涉密）结束后，用千问把自己的听课录音整理成学习笔记。",a:true,e:"可以。公开的、非涉密的培训内容可以整理。但涉密会议、监区内一律不录音、不上传。"},
    {q:"为了写得更准确，把服刑人员的档案页拍照发给 AI，让它帮忙写评语。",a:false,e:"不可以。档案属于人员信息和工作秘密，严禁上传任何 AI。评语要由民警根据事实亲自撰写。"},
    {q:"用 AI 写一条普法短视频脚本，经宣传部门审核后发布。",a:true,e:"可以。使用公开法规，不涉及真实人员和监区画面，按规定标注 AI 生成并经审批，就是合规用法。"},
    {q:"下班后把一张监控截图发给 AI，问“这个人在干什么”。",a:false,e:"不可以。监控画面属于监管安全信息，任何时间、任何地点都不能外传。"},
    {q:"AI 给出了一条法律条文，直接原样写进执法文书。",a:false,e:"不可以。AI 可能编造法条（还记得“第一百零八条”吗？）。必须对照官方文本核实，由本人负责。"},
    {q:"值班巡查时，用手机 AI 拍照识别监区里的可疑物品。",a:false,e:"不可以。手机不进监区。发现可疑物品，立即按规定报告和处置。"}];
  const box=$("#quiz1");const ans=store.get("quiz1",{});
  box.innerHTML=Q.map((x,i)=>`<div class="quiz-q rv" data-i="${i}"><div class="qn">情景 ${i+1} / ${Q.length}</div><div class="qt">${x.q}</div><div class="quiz-opts"><button class="ok" data-v="1">✓ 可以</button><button class="no" data-v="0">✗ 不可以</button></div><div class="quiz-fb"><div></div></div></div>`).join("");
  $$(".quiz-q",box).forEach(observe);
  function show(i,v){const el=$(`.quiz-q[data-i="${i}"]`,box),x=Q[i],right=(v===1)===x.a;
    $$("button",el).forEach(b=>b.classList.toggle("picked",+b.dataset.v===v));
    $(".quiz-fb div",el).innerHTML=`<b style="color:${right?"#41b883":"#e0574f"}">${right?"答对了！":"再想想。"}</b> ${x.e}`;$(".quiz-fb",el).classList.add("show");score()}
  function score(){const n=Object.keys(ans).length;if(!n)return;const r=Object.entries(ans).filter(([i,v])=>(v===1)===Q[i].a).length;
    $("#quiz1Score").innerHTML=`已答 ${n}/${Q.length} 题，答对 <span class="gold">${r}</span> 题${n===Q.length?(r===Q.length?"　🏅 满分！红线意识过关":"　回看讲解，把错题弄明白"):""}`}
  box.addEventListener("click",e=>{const b=e.target.closest(".quiz-opts button");if(!b)return;const i=+b.closest(".quiz-q").dataset.i,v=+b.dataset.v;ans[i]=v;store.set("quiz1",ans);show(i,v)});
  Object.entries(ans).forEach(([i,v])=>show(+i,v));
})();

/* ---------- 第三讲：模板库 ---------- */
(function(){
  const T=[
    {n:"个人工作总结",pain:"写来写去都是“认真学习、努力工作”，自己都觉得空。",
     code:"你是一名有经验的监狱政工干部。请帮我写一份【总结类型，如：岗前培训个人总结】，字数约【800】字。\n\n我的真实情况（只写我自己的经历）：\n1. 主要做了：【……】\n2. 最大收获：【……，最好有一个具体场景】\n3. 不足之处：【……】\n4. 下一步打算：【……】\n\n要求：语言朴实具体，少用套话；按“收获—不足—打算”三部分；不要编造我没提供的事例和数据。",
     chk:["事例、数据必须是自己真实经历的","删掉 AI 自动添加的空话、口号","不写入任何人员信息和监管细节"]},
    {n:"会议纪要整理",pain:"开完会记了一堆零散笔记，整理成纪要要花一个小时。",
     code:"请把下面的会议记录整理成规范的会议纪要。\n\n会议名称：【……】\n参会范围：【……（不写具体人名也可以）】\n原始记录：\n【粘贴录音转写或笔记，必须是非涉密会议】\n\n要求：\n1. 分为“会议主要内容”“议定事项”“工作要求”三部分；\n2. 议定事项写清楚：做什么、谁牵头、什么时间完成；\n3. 只依据原始记录整理，不要补充记录里没有的内容。",
     chk:["仅限非涉密会议","议定事项逐条与原始记录核对","印发前按程序报领导审核"],warn:"涉密会议、内部敏感会议的内容一律不得输入"},
    {n:"宣传稿 / 信息简报",pain:"活动搞得很好，稿子写出来却像流水账。",
     code:"你是一名政工宣传干事。请根据以下素材写一篇【单位内网信息 / 公众号稿件】，【600】字左右。\n\n活动名称：【……】\n活动时间：【……】\n主要环节：【……】\n亮点与成效：【……】\n\n要求：标题新颖不夸张；导语一句话讲清楚“谁、何时、做了什么、有何意义”；正文有细节、有温度；不出现服刑人员的姓名、面部和可识别信息。\n另外请给出 3 个备选标题。",
     chk:["核对时间、名称、数据是否准确","不出现服刑人员可识别信息","以单位名义发布须经宣传部门审核"]},
    {n:"谈话记录规范化",pain:"谈话时匆匆记了要点，事后整理成规范记录费时费力。",
     code:"请帮我把下面的谈话要点整理成规范的个别谈话记录草稿。\n\n（注意：以下内容已脱敏，用“A某”代替姓名，不含编号、监区等信息）\n谈话对象：A某\n谈话事由：【……】\n谈话要点：\n【……】\n\n要求：\n1. 按“谈话事由—对象情况—谈话内容—教育引导—后续措施”的结构整理；\n2. 语言客观、准确，只记录事实，不做推测；\n3. 用【待核实】标出你认为表述不清楚的地方。",
     chk:["真实姓名、编号等只在单位系统内补全","逐句核对是否与谈话事实一致","后续措施按单位制度执行，由本人签字负责"],warn:"只在脱敏后使用；正式记录以单位规定格式和系统为准"},
    {n:"教育微课讲稿",pain:"临时安排上一节法治教育课，不知道从哪里讲起。",
     code:"你是一名法治教育讲师。请为服刑人员设计一节【15】分钟的法治教育微课。\n\n主题：【如：正确认识减刑假释】\n对象特点：【文化程度参差不齐，需要通俗易懂】\n\n请输出：\n1. 讲稿（口语化，配一个公开报道的典型案例）；\n2. 3 个课堂互动问题；\n3. 5 道随堂小测（选择题，附答案）；\n4. 每个知识点注明法律依据（法规名称+条款）。",
     chk:["法律依据逐条对照官方文本","案例必须是公开、已裁判的典型案例","课件内容经教育改造部门审核"]}];
  const tabs=$("#tplTabs");tabs.innerHTML=T.map((t,i)=>`<button data-i="${i}" class="${i?"":"on"}">${t.n}</button>`).join("");
  function pick(i){const t=T[i];$$("button",tabs).forEach((b,k)=>b.classList.toggle("on",k===i));$("#tplTitle").textContent=t.n;$("#tplPain").innerHTML="😣 痛点："+t.pain;
    $("#tplCode").innerHTML=esc(t.code).replace(/【(.*?)】/g,'<span class="ph">【$1】</span>');
    $("#tplCheck").innerHTML=t.chk.map(c=>`<li>${c}</li>`).join("")+(t.warn?`<li class="warn">${t.warn}</li>`:"")}
  tabs.addEventListener("click",e=>{const b=e.target.closest("button");if(b)pick(+b.dataset.i)});pick(0);
})();

/* ---------- 第三讲：谈话陪练 ---------- */
(function(){
  const P=[
    {n:"沉默型",d:"话少、回避、情绪低落",c:"#4fb3e8",s:[
      ["u","你好，最近吃饭睡觉怎么样？"],["a","……还行。"],["u","我注意到你这两天话比较少，是有什么事情吗？"],["a","没什么。"],
      ["u","没关系，不想说也可以。我就坐这儿陪你一会儿。家里最近有来信吗？"],["a","（沉默了一会儿）……我妈病了，我也帮不上忙。"],
      ["u","听起来你很担心她，也很自责。这种心情我能理解。你愿意多说说吗？我们一起想想能做点什么。"],
      ["r","AI 点评（模拟）\n✓ 用开放式问题，接纳沉默，没有催促\n✓ 准确回应了“担心 + 自责”两种情绪\n→ 建议：下一步了解可以按规定使用的联系渠道，持续关注情绪变化，必要时及时报告\n共情 9 ｜ 提问技巧 8 ｜ 规则底线 8 ｜ 风险识别 7"]]},
    {n:"对抗型",d:"抵触、易激动、觉得不公平",c:"#e0574f",s:[
      ["u","今天找你聊聊上周劳动现场的事。"],["a","有什么好聊的？又不是我一个人的错，你们就盯着我！"],["u","你觉得处理得不公平，心里有气。"],["a","本来就是！"],
      ["u","我听到了。今天我们不急着下结论，你先按你的角度把经过讲一遍，好吗？"],["a","……那天是他先推的我。"],
      ["u","好，这一点我记下来，会去核实现场情况。同时你也要清楚，不管谁先动手，动手本身就违反监规。我们一起想想下次遇到这种情况怎么做更好。"],
      ["r","AI 点评（模拟）\n✓ 先接住情绪，再谈事实\n✓ 承诺核实，没有偏听偏信\n✓ 守住了规则底线\n→ 建议：全程保持语气平稳；不翻旧账，不做职责之外的承诺\n共情 8 ｜ 提问技巧 8 ｜ 规则底线 9 ｜ 风险识别 8"]]},
    {n:"试探型",d:"拉关系、找借口、试探底线",c:"#d6ad55",s:[
      ["a","警官，你刚来吧？看着挺年轻的。"],["u","是的。有什么事情可以跟我说。"],["a","也没啥大事……就是想问问，你能不能帮我给家里带句话？就一句，不麻烦。"],
      ["u","通信和会见都有规定的渠道，我不能私下帮你传话。家里有事，可以按规定写信或者申请。"],["a","哎呀，这点小事，别的警官都……"],
      ["u","规定对每个人都一样，我也不例外。如果家里确实有急事，我可以帮你按程序向上反映。"],
      ["r","AI 点评（模拟）\n✓ 识别出“拉近关系 → 提小要求 → 拿别人比较”的试探套路\n✓ 拒绝明确、态度平和，并给出合规渠道\n→ 提醒：此类试探须按规定向带班领导报告并记录\n共情 7 ｜ 提问技巧 7 ｜ 规则底线 10 ｜ 风险识别 9"]]}];
  const pb=$("#persona");let cur=0,playing=0;
  pb.innerHTML=P.map((p,i)=>`<button data-i="${i}" class="${i?"":"on"}" style="color:var(--paper-ink);border-color:${i?"#cfc6b2":"var(--gold)"}"><span class="av" style="background:${p.c}22;color:${p.c}"><svg width="26" height="26"><use href="#i-talk"/></svg></span><span><b>${p.n} · ${String.fromCharCode(65+i)}某</b><small style="color:var(--paper-ink-2)">${p.d}</small></span></button>`).join("");
  const body=$("#chatBody");
  function reset(){playing++;body.innerHTML=`<div class="msg sys">虚构演示 · ${P[cur].n}谈话对象 · 点击“播放对练”</div>`;$("#chatTitle").textContent=`谈话陪练 · ${P[cur].n}`}
  async function play(){const my=++playing;body.innerHTML=`<div class="msg sys">AI 已进入角色：${P[cur].n}谈话对象（虚构）</div>`;
    for(const [w,t] of P[cur].s){if(my!==playing)return;
      const m=document.createElement("div");m.className="msg "+(w==="u"?"u":w==="a"?"a":"review");
      if(w!=="u"){m.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';body.appendChild(m);body.scrollTop=body.scrollHeight;await sleep(900);if(my!==playing)return}
      else body.appendChild(m);
      const who=w==="u"?"民警（学员）":w==="a"?`${String.fromCharCode(65+cur)}某（AI 扮演）`:"";
      m.innerHTML=who?`<span class="who">${who}</span>`:"";const span=document.createElement("span");m.appendChild(span);
      for(let i=1;i<=t.length;i+=2){span.textContent=t.slice(0,i);body.scrollTop=body.scrollHeight;await sleep(w==="r"?14:28);if(my!==playing)return}
      span.textContent=t;body.scrollTop=body.scrollHeight;await sleep(650)}}
  pb.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;cur=+b.dataset.i;$$("button",pb).forEach((x,k)=>{x.classList.toggle("on",k===cur);x.style.borderColor=k===cur?"var(--gold)":"#cfc6b2"});reset();setPrompt()});
  $("#chatPlay").onclick=play;$("#chatReset").onclick=reset;reset();onView(body,play);
  function setPrompt(){$("#coachPrompt").innerHTML=esc(`你现在是一个用于民警沟通能力训练的模拟谈话对象。

请扮演：一名【${P[cur].n}】服刑人员（完全虚构，不对应任何真实个人）。
背景：【虚构背景，如：入监两年，近期家里出现变故】

规则：
1. 每次只说一两句话，像真实对话一样；
2. 根据我的沟通方式调整态度：我尊重、共情，你逐步打开心扉；我说教、威胁，你更加抗拒；
3. 不要主动跳出角色；
4. 当我输入“结束”，请跳出角色，从“共情、提问技巧、规则底线、风险识别”四个方面各打 10 分制分数，并给出具体改进建议。

现在开始，你先开口。`).replace(/【(.*?)】/g,'<span class="ph">【$1】</span>')}
  setPrompt();
})();

/* ---------- 休息倒计时 ---------- */
(function(){
  const TOTAL=20*60;let left=TOTAL,timer=null;const C=2*Math.PI*96;
  function draw(){const m=Math.floor(left/60),s=left%60;$("#clock").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;$("#ringFg").setAttribute("stroke-dashoffset",C*(1-left/TOTAL))}
  $("#clockStart").onclick=function(){if(timer){clearInterval(timer);timer=null;this.textContent="继续";return}this.textContent="暂停";timer=setInterval(()=>{left--;draw();if(left<=0){clearInterval(timer);timer=null;$("#clock").textContent="上课";toast("休息结束，请回到座位")}},1000)};
  $("#clockReset").onclick=()=>{clearInterval(timer);timer=null;left=TOTAL;$("#clockStart").textContent="开始计时";draw()};draw();
  const F=["💡 大模型的“幻觉”不是故障，而是它工作方式的副产品：它预测的是“像不像”，不是“对不对”。",
    "💡 ChatGPT 里的“T”，指的就是 2017 年提出的 Transformer 架构。",
    "💡 提问越具体，回答越有用：角色 + 任务 + 背景 + 要求 + 格式。",
    "💡 《人工智能生成合成内容标识办法》已于 2025 年 9 月 1 日起施行，AI 生成的内容要标识。",
    "💡 智能体不是聊天机器人：它能调用工具、按流程把事办完。",
    "💡 红线自测：下班后把监控截图发给 AI 问“这人在干嘛”，行不行？当然不行。"];
  let k=0;const el=$("#facts");
  function next(){el.style.opacity=0;setTimeout(()=>{el.textContent=F[k++%F.length];el.style.transition="opacity .6s";el.style.opacity=1},500)}next();setInterval(()=>{if(!document.hidden)next()},6500);
})();

/* ---------- 第四讲：智能体卡片 ---------- */
(function(){
  const A=[
    ["i-scale","法规制度问答助手","依据公开法规作答，每个回答注明出处。","自然语言提问","回答 + 法规名称与条款号","监狱法、人民警察法等公开法规文本","不回答内部工作安排；查不到依据就说不知道"],
    ["i-talk","个别谈话陪练员","模拟三类谈话对象，对练结束后打分点评。","选定对象类型 + 你的话","角色回应 + 四维度评分与建议","沟通技巧、公开心理学资料","角色完全虚构；不输入真实人员信息"],
    ["i-pen","公文写作助手","内置公文格式规范，按场景出草稿和自查清单。","写作场景 + 脱敏后的要点","规范草稿 + 格式自查清单","GB/T 9704 公文格式、公开范文","不处理涉密文件；签发前人工审核"],
    ["i-graduate","教育微课生成器","输入主题，一次输出讲稿、课件大纲和测验。","教育主题 + 对象特点","讲稿、PPT 大纲、随堂测验","公开典型案例、法治教育资料","不使用未公开案件；内容须审核"],
    ["i-book","新警学习教练","按学习范围出题、批改，自动整理错题本。","学习范围或章节","练习题、解析、错题本","公开法规与培训教材","以官方文本为准；不涉及考试泄题"],
    ["i-heart","心理健康科普助手","压力管理与情绪调节科普，提示求助渠道。","想了解的话题","科普内容、放松方法、求助渠道","公开的心理健康科普资料","不做诊断；遇到危机情况提示立即求助、上报"],
    ["i-film","普法短视频编剧","输入普法主题，输出脚本、分镜和画面提示词。","普法主题 + 时长","脚本、分镜表、画面生成提示词","公开法规、宣传口径","不出现真实人员和监区；发布须审批"]];
  const box=$("#agents");
  box.innerHTML=A.map((a,i)=>`<div class="ag-card rv d${i%4}"><div class="ag-in"><div class="ag-f"><div class="em"><svg><use href="#${a[0]}"/></svg></div><h4>${a[1]}</h4><p>${a[2]}</p><span class="flip-hint">点击翻面 ↻</span></div>
    <div class="ag-b"><h4 style="color:var(--gold-2);margin-bottom:10px">${a[1]}</h4><dl><dt>输入</dt><dd>${a[3]}</dd><dt>输出</dt><dd>${a[4]}</dd><dt>知识</dt><dd>${a[5]}</dd><dt>红线</dt><dd class="r">${a[6]}</dd></dl></div></div></div>`).join("");
  $$(".ag-card",box).forEach(c=>{observe(c);c.onclick=()=>c.classList.toggle("flip")});
})();

/* ---------- 第四讲：开发演示 ---------- */
(function(){
  $("#specText").textContent=`请帮我开发一个“法规制度问答助手”网页应用。

【使用者】新录用监狱人民警察，用于学习法规、准备考试。

【功能】
1. 用户提问后，先从知识库检索相关法条，再依据条文回答；
2. 每个回答必须注明出处（法规名称 + 条款号）；
3. 知识库里找不到依据时，明确回答“不知道”，不得编造；
4. 提供“随机出题”按钮，根据法规生成选择题并给出解析。

【知识库】只使用我提供的公开法规文本（PDF）。

【安全要求】不保存用户的提问记录；遇到涉及具体人员、监管安全、内部工作安排的问题，拒绝回答并提醒保密纪律。

【界面】简洁，手机可用，深蓝色主题。

【技术】请你选择合适的技术方案，写好代码、测试和运行说明。`;
  const TERM=["$ 在项目文件夹中启动 Claude / Codex","› 请阅读 需求说明.md 并开始开发","","● 读取 需求说明.md … 已理解 4 项功能、3 项安全要求","● 方案：网页前端 + 法规检索 + 大模型接口","  + 新建 app/index.html        问答界面（深蓝主题，适配手机）","  + 新建 app/server.py         后端服务","  + 新建 app/retriever.py      法规切分与检索","  + 新建 app/prompts.py        角色设定：只依据条文回答并标注出处","  + 新建 app/guard.py          敏感问题拦截与保密提醒","  + 新建 app/quiz.py           随机出题与解析","  + 新建 README.md             运行说明","● 运行测试 …","  ✓ 有依据的问题：回答并给出处","  ✓ 无依据的问题：回答“不知道”","  ✓ 涉及内部安排的问题：拒答并提醒","● 已启动本地预览：http://localhost:8000"];
  const KB=["中华人民共和国监狱法.pdf","中华人民共和国人民警察法.pdf","中华人民共和国刑法（节选）.pdf","中华人民共和国刑事诉讼法（节选）.pdf","中华人民共和国禁毒法.pdf","戒毒条例.pdf"];
  const urls=["需求说明.md","终端 · Claude / Codex","知识库 · 上传文档","http://localhost:8000","部署方案"];
  let cur=0,run=0,auto=null;const steps=$$("#bSteps li"),bodies=$$(".mock-body");
  async function show(i){cur=i;const my=++run;steps.forEach((s,k)=>{s.classList.toggle("on",k===i);s.classList.toggle("done",k<i)});bodies.forEach((b,k)=>b.classList.toggle("on",k===i));$("#bUrl").textContent=urls[i];
    if(i===1){const t=$("#term");t.innerHTML="";for(const l of TERM){if(my!==run)return;const d=document.createElement("div");d.textContent=l||" ";if(l.startsWith("  ✓"))d.style.color="#7fe0b0";if(l.startsWith("●"))d.style.color="#f1d38c";if(l.startsWith("$")||l.startsWith("›"))d.style.color="#9ad6f6";t.appendChild(d);await sleep(l?260:120)}}
    if(i===2){const k=$("#kbFiles");k.innerHTML=KB.map(f=>`<div class="file"><span class="fi">PDF</span><div style="flex:1"><div>${f}</div><div class="meter"><i></i></div></div><span class="st">等待中</span></div>`).join("");
      const fs=$$(".file",k);for(const f of fs){if(my!==run)return;$(".meter i",f).style.width="100%";$(".st",f).textContent="解析中…";await sleep(700);$(".st",f).textContent="✓ 已入库"}}
    if(i===3){$$(".mock-body[data-i='3'] .cm").forEach((c,k)=>{c.style.opacity=0;setTimeout(()=>{c.style.transition="opacity .5s";c.style.opacity=1},500+k*900)})}}
  $("#bSteps").addEventListener("click",e=>{const li=e.target.closest("li");if(li){stopAuto();show(+li.dataset.i)}});
  $("#bNext").onclick=()=>{stopAuto();show((cur+1)%5)};
  function stopAuto(){if(auto){clearInterval(auto);auto=null;$("#bAuto").textContent="自动演示"}}
  $("#bAuto").onclick=function(){if(auto){stopAuto();return}this.textContent="停止";show(0);auto=setInterval(()=>show((cur+1)%5),6500)};
})();

/* ---------- 场景插画（分镜 / 播放器共用） ---------- */
function scene(i,W,H){
  const cx=W/2,cy=H/2,m=Math.min(W,H);let s=`<rect width="${W}" height="${H}" fill="#0b1a33"/>`;
  if(i===0){s=`<defs><linearGradient id="sk${W}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a3563"/><stop offset=".7" stop-color="#d6ad55"/><stop offset="1" stop-color="#f1d38c"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sk${W})"/><circle cx="${cx}" cy="${H*.72}" r="${m*.18}" fill="#fff4d6" opacity=".9"/>`;
    let x=0,b="";while(x<W){const w=W*(.06+Math.random()*.06),h=H*(.15+Math.random()*.25);b+=`<rect x="${x}" y="${H-h}" width="${w}" height="${h}" fill="#0b1a33"/>`;x+=w+1}s+=b}
  if(i===1){s+=`<rect x="${cx-m*.22}" y="${cy-m*.4}" width="${m*.44}" height="${m*.8}" rx="${m*.05}" fill="#11264a" stroke="#4c6a9c" stroke-width="${m*.012}"/>
    <rect x="${cx-m*.16}" y="${cy-m*.28}" width="${m*.26}" height="${m*.09}" rx="${m*.03}" fill="#d6ad55"/><rect x="${cx-m*.1}" y="${cy-m*.14}" width="${m*.26}" height="${m*.13}" rx="${m*.03}" fill="#1f3a6a"/><rect x="${cx-m*.16}" y="${cy+m*.04}" width="${m*.22}" height="${m*.09}" rx="${m*.03}" fill="#d6ad55"/><rect x="${cx-m*.1}" y="${cy+m*.18}" width="${m*.26}" height="${m*.09}" rx="${m*.03}" fill="#1f3a6a"/>
    <text x="${cx+m*.03}" y="${cy-m*.06}" font-size="${m*.06}" fill="#f1d38c" text-anchor="middle" font-weight="700">AI</text>`}
  if(i===2){s+=`<rect x="${cx-m*.25}" y="${cy-m*.33}" width="${m*.5}" height="${m*.66}" rx="${m*.02}" fill="#f5f1e8"/>`;for(let k=0;k<6;k++)s+=`<rect x="${cx-m*.19}" y="${cy-m*.24+k*m*.09}" width="${m*(.38-(k%3)*.06)}" height="${m*.025}" fill="#c9c1ae"/>`;
    s+=`<g transform="rotate(-12 ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="${m*.2}" fill="none" stroke="#e0574f" stroke-width="${m*.03}"/><text x="${cx}" y="${cy+m*.07}" font-size="${m*.2}" fill="#e0574f" text-anchor="middle" font-weight="900">禁</text></g>`}
  if(i===3){s+=`<rect x="${cx-m*.32}" y="${cy-m*.3}" width="${m*.64}" height="${m*.6}" rx="${m*.03}" fill="#f5f1e8"/>`;for(let k=0;k<5;k++){const y=cy-m*.2+k*m*.1;s+=`<rect x="${cx-m*.26}" y="${y}" width="${m*.52}" height="${m*.03}" fill="#d9d1bf"/><rect x="${cx-m*.26+(k*m*.08)%(m*.3)}" y="${y-m*.008}" width="${m*.14}" height="${m*.046}" rx="${m*.01}" fill="${k%2?"#41b883":"#e0574f"}" opacity=".85"/>`}}
  if(i===4){const r=m*.28;s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#d6ad55" stroke-width="${m*.012}" stroke-dasharray="${m*.03} ${m*.03}"/>`;
    [["AI","#4fb3e8",-90],["人","#d6ad55",30],["制","#41b883",150]].forEach(([t,c,a])=>{const x=cx+r*Math.cos(a*Math.PI/180),y=cy+r*Math.sin(a*Math.PI/180);s+=`<circle cx="${x}" cy="${y}" r="${m*.09}" fill="${c}"/><text x="${x}" y="${y+m*.03}" font-size="${m*.08}" text-anchor="middle" fill="#06101f" font-weight="800">${t}</text>`})}
  if(i===5){s=`<rect width="${W}" height="${H}" fill="#06101f"/><path d="M${cx} ${cy-m*.32} L${cx-m*.24} ${cy-m*.22} V${cy} C${cx-m*.24} ${cy+m*.2} ${cx-m*.1} ${cy+m*.3} ${cx} ${cy+m*.36} C${cx+m*.1} ${cy+m*.3} ${cx+m*.24} ${cy+m*.2} ${cx+m*.24} ${cy} V${cy-m*.22}Z" fill="#11264a" stroke="#d6ad55" stroke-width="${m*.015}"/><text x="${cx}" y="${cy+m*.04}" font-size="${m*.1}" fill="#f1d38c" text-anchor="middle" font-weight="900">AI</text>`}
  return s}

/* ---------- 第五讲：短视频流水线 ---------- */
(function(){
  const SHOTS=[["0–8s","晨光中的城市天际线，镜头缓慢推进","入职第一天，我们多了一位新同事。"],["8–18s","手机屏幕上弹出 AI 对话气泡","它能写材料、出提纲，还能陪我们练谈话。"],
    ["18–30s","文件上盖下红色“禁”字印章","但有三样东西永远不能交给它：人员信息、监管安全信息、内部文件。"],["30–42s","材料上的敏感字段被逐一替换成色块","先脱敏，再提问，只给它解决问题需要的信息。"],
    ["42–52s","环形流程：AI 发现—民警判断—制度兜底","AI 给草稿，人做决定；用了 AI，责任不转移。"],["52–60s","盾牌标识与标语定格","用 AI，守规矩，担责任。新警第一课，从这里开始。"]];
  const S=[
    {n:"选题",i:"i-bulb",sm:"AI 出点子",tools:["千问","DeepSeek","豆包"],d:"把目的、对象、时长告诉 AI，让它给出多个选题，人来挑。",
     p:"我要为新录用监狱警察制作一条 60 秒竖屏短视频，主题是“正确、安全地使用 AI”。观众是新警，风格庄重、有温度。请给出 5 个选题，每个附一句话说明亮点。",
     o:()=>`<h4 style="margin-bottom:10px">AI 给出的 5 个选题</h4>`+["《新警第一课：AI 用对，规矩守住》","《我的新同事，不会犯困但会“编”》","《三不传：AI 时代的保密新考题》","《先脱敏，再提问》","《AI 给草稿，人做决定》"].map((t,k)=>`<div style="padding:10px 14px;border-radius:10px;margin:6px 0;${k===0?"background:var(--gold);color:var(--navy-0);font-weight:700":"background:rgba(255,255,255,.04)"}">${k===0?"✓ ":""}${t}</div>`).join("")},
    {n:"脚本分镜",i:"i-list",sm:"AI 写脚本",tools:["千问","DeepSeek"],d:"选定题目后，让 AI 按秒数写分镜脚本：每个镜头的画面和旁白一一对应。",
     p:"请为《新警第一课：AI 用对，规矩守住》写 60 秒分镜脚本，共 6 个镜头。用表格输出：镜号、时长、画面描述、旁白。画面中不出现真实人员和监区，旁白每镜不超过 25 字。",
     o:()=>`<table class="script-t"><tr><th>镜</th><th>时长</th><th>画面</th><th>旁白</th></tr>${SHOTS.map((r,k)=>`<tr><td>${k+1}</td><td style="white-space:nowrap">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table>`},
    {n:"生成画面",i:"i-img",sm:"文生图 / 图生视频",tools:["即梦","可灵","通义万相"],d:"每个镜头先用文字生成关键画面，再让画面“动起来”。提示词越具体，画面越可控。",
     p:"【镜头1 · 文生图】清晨的城市天际线剪影，金色朝阳从地平线升起，天空由深蓝渐变到金色，电影感，竖构图 9:16，写实风格，无人物，无文字。\n\n【镜头1 · 图生视频】镜头缓慢向前推进，阳光逐渐变亮，云层轻微流动，时长 5 秒。",
     o:()=>`<h4 style="margin-bottom:10px">6 个镜头的关键画面（示意）</h4><div class="sb">${SHOTS.map((r,k)=>`<figure><svg viewBox="0 0 160 90">${scene(k,160,90)}</svg><figcaption>镜 ${k+1} · ${r[0]}</figcaption></figure>`).join("")}</div>`},
    {n:"配音",i:"i-mic",sm:"AI 配音 / 数字人",tools:["剪映 AI 配音","千问","豆包"],d:"把旁白交给 AI 配音，选择音色、调整语速和停顿。需要出镜讲解时，可用授权的数字人形象。",
     p:"配音稿（男声，沉稳，语速 0.95 倍，句间停顿 0.5 秒）：\n入职第一天，我们多了一位新同事。\n它能写材料、出提纲，还能陪我们练谈话。\n……\n用 AI，守规矩，担责任。",
     o:()=>`<h4>音色：沉稳男声 · 语速 0.95×</h4><div class="wave" style="margin:16px 0">${Array.from({length:48},(_,k)=>`<i style="animation-delay:${(k%12)*.07}s"></i>`).join("")}</div><p style="color:var(--ink-2);font-size:14.5px">▶ 入职第一天，我们多了一位新同事……</p><p style="font-size:13.5px;color:#ff9d96;margin-top:10px">⚠ 不使用真实人物的声音和形象进行克隆。</p>`},
    {n:"剪辑字幕",i:"i-cut",sm:"一键成片",tools:["剪映"],d:"把画面、配音、音乐拖进时间线，自动识别字幕，加上片头片尾和“AI 生成”标识。",
     p:"剪辑要点：\n1. 画面按配音节奏卡点；\n2. 自动识别字幕，逐句校对错别字；\n3. 背景音乐选用有版权授权的曲目；\n4. 片头或角标添加“AI 生成”标识。",
     o:()=>`<h4 style="margin-bottom:6px">剪辑时间线</h4><div class="edit-tl playhead">${[["视频",SHOTS.map((s,k)=>[`镜${k+1}`,"#3a5a94",[8,10,12,12,10,8][k]])],["配音",[["旁白",'#b8892a',60]]],["字幕",SHOTS.map((s,k)=>[s[2].slice(0,6),"#2f7d5c",[8,10,12,12,10,8][k]])],["音乐",[["背景音乐（已授权）","#6a4c93",60]]]].map(([l,cl])=>`<div class="lbl">${l}</div><div class="trk">${cl.map(c=>`<span style="flex:${c[2]};background:${c[1]}">${c[0]}</span>`).join("")}</div>`).join("")}</div>`},
    {n:"审核发布",i:"i-send",sm:"人工把关",tools:["宣传部门审核"],d:"最后一步只能由人来做：逐项核对后按程序审批，再发布。",
     p:"发布前审核清单：\n□ 无服刑人员、戒毒人员可识别信息\n□ 无监区内部、设施、监控画面\n□ 已标注“AI 生成”\n□ 字幕、数据、法条准确\n□ 音乐、字体、素材有授权\n□ 已经宣传部门审核批准",
     o:()=>`<h4 style="margin-bottom:8px">审核清单</h4><ul class="checklist" style="color:var(--ink)">${["无服刑人员、戒毒人员可识别信息","无监区内部、设施、监控画面","已标注“AI 生成”","字幕、数据、法条准确","音乐、字体、素材有授权","已经宣传部门审核批准"].map((t,k)=>`<li style="border-color:var(--line);opacity:0;animation:fadein .4s ${k*.35}s forwards">${t}</li>`).join("")}</ul>`}];
  const pipe=$("#pipe");
  pipe.innerHTML=S.map((s,k)=>`<div class="pp rv d${k%5}" data-i="${k}" style="border-color:#d9d1bf;background:#fff"><div class="pn">STEP ${k+1}</div><svg><use href="#${s.i}"/></svg><b>${s.n}</b><small>${s.sm}</small></div>`).join("");
  $$(".pp",pipe).forEach(observe);
  let cur=0,auto=null;
  function show(i){cur=i;const s=S[i];$$(".pp",pipe).forEach((p,k)=>{p.classList.toggle("on",k===i);p.classList.toggle("done",k<i);p.style.background=k===i?"#f8efd6":"#fff";p.style.borderColor=k===i?"#d6ad55":k<i?"#9fd8bb":"#d9d1bf"});
    $("#pdTitle").textContent=`第 ${i+1} 步 · ${s.n}`;$("#pdDesc").textContent=s.d;$("#pdTools").innerHTML=s.tools.map(t=>`<span class="pill y" style="background:#f4e8c9;color:#93671a">${t}</span>`).join("");
    $("#pdPrompt").textContent=s.p;const o=$("#pdOut");o.style.opacity=0;setTimeout(()=>{o.innerHTML=s.o();o.style.transition="opacity .5s";o.style.opacity=1},150)}
  pipe.addEventListener("click",e=>{const p=e.target.closest(".pp");if(p){stop();show(+p.dataset.i)}});
  $("#pipeNext").onclick=()=>{stop();show((cur+1)%S.length)};
  function stop(){if(auto){clearInterval(auto);auto=null;$("#pipeAuto").textContent="自动演示"}}
  $("#pipeAuto").onclick=function(){if(auto){stop();return}this.textContent="停止";show(0);auto=setInterval(()=>show((cur+1)%S.length),7000)};
  show(0);

  /* 播放器：有 demo.mp4 就用真视频，否则播放分镜动画 */
  const v=$("#demoVideo");v.addEventListener("loadedmetadata",()=>{v.style.display="block";$("#phWrap").style.display="none"});v.src=v.dataset.file;
  let k=0,t0=Date.now();const art=$("#phArt"),sub=$("#phSub"),bar=$("#phBar");
  function frame(){art.innerHTML=scene(k,90,160);sub.textContent=SHOTS[k][2]}frame();
  setInterval(()=>{if(document.hidden||$("#phWrap").style.display==="none")return;const el=(Date.now()-t0)/1000;const total=6*4;bar.style.width=(el%total)/total*100+"%";const nk=Math.floor((el%total)/4);if(nk!==k){k=nk;art.style.opacity=0;setTimeout(()=>{frame();art.style.transition="opacity .5s";art.style.opacity=1},250)}},200);
})();

window.scene=scene;window.__toast=toast;window.__store=store;
})();

/* 真实案例：assets/cases/caseN.jpg 存在时显示原报道配图，否则显示示意插画 */
document.querySelectorAll(".case").forEach(c=>{
  const real=c.querySelector("img.real");if(!real)return;
  real.onload=()=>{real.hidden=false;c.querySelector("img.toon").hidden=true;
    const src=c.querySelector(".case-src");c.querySelector(".case-credit").textContent="图：" + (src&&src.dataset.credit||"原报道")};
  real.src=real.dataset.file;
});
