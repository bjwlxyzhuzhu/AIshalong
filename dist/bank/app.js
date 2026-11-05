/* NexAI 政法版 · 交互脚本 */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem("nexai-b-"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("nexai-b-"+k,JSON.stringify(v))}catch(e){}}};
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
const DAY=[{"t": "08:30", "n": "晨会", "i": "i-sun", "can": "会前把昨日业务通报（已脱敏）整理成三条要点；用千问录下内部培训式晨会，会后出待办。", "cant": "客户名单、个人业绩明细、未公开经营数据不输入外网 AI。"}, {"t": "09:00", "n": "柜面厅堂", "i": "i-team", "can": "课后用规程问答助手学习业务规程，整理常见问题的标准应答话术。", "cant": "客户证件、卡号、交易信息不上传；业务系统界面不拍照发给 AI。"}, {"t": "10:30", "n": "客户拜访", "i": "i-walk", "can": "用公开资讯准备行业简报和拜访提纲；拜访前和 AI 陪练沟通话术。", "cant": "客户财务报表、授信与征信信息不发给外网 AI。"}, {"t": "14:00", "n": "写材料", "i": "i-pen", "can": "总结、汇报、通知的提纲和润色；长制度文件速读出要点。", "cant": "经营数据和内部文件不上传；数据处用【待填】由本人补全。"}, {"t": "15:30", "n": "报表分析", "i": "i-list", "can": "写 Excel 公式、做透视表和图表，用模拟数据先把方法练熟。", "cant": "真实客户数据、经营明细不上传外网。"}, {"t": "16:30", "n": "营销宣传", "i": "i-film", "can": "反诈与金融知识普及的文案、海报和短视频脚本。", "cant": "不承诺收益、不夸大宣传；未经消保与合规审核不发布。"}, {"t": "19:00", "n": "学习提升", "i": "i-book", "can": "制度学习、出题自测、考证复习，让 AI 当私人教练。", "cant": "AI 给出的条款和数字一律对照原文核实。"}];
(function(){
  const box=$("#day");box.innerHTML=DAY.map((d,i)=>`<div class="dn rv d${i%5}" data-i="${i}"><div class="dot"><svg><use href="#${d.i}"/></svg></div><div><div class="tm">${d.t}</div><div class="nm">${d.n}</div></div></div>`).join("");
  $$(".dn",box).forEach(observe);
  function pick(i){$$(".dn",box).forEach((n,k)=>n.classList.toggle("on",k===i));const d=DAY[i];$("#ddT1").textContent=d.n;$("#ddCan").textContent=d.can;$("#ddCant").textContent=d.cant}
  box.addEventListener("click",e=>{const n=e.target.closest(".dn");if(n)pick(+n.dataset.i)});pick(2);
})();

/* ---------- 投票 ---------- */
(function(){
  const opts=["写总结、汇报等材料","整理会议纪要","制作 Excel 报表","客户沟通前的准备","营销文案与短视频","制度学习与考试"];
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
  const lines=["主讲人：各位同事好，今天我们聊聊“让AI智能体成为工作搭子”。","主讲人：首先记住一句话，智能体是搭子，不是替身。","主讲人：我们先讲合规红线，再讲岗位实操……"];
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
  const steps=["读取「季度业务资料」文件夹，发现 18 个文件","按产品线识别每个文件的内容","汇总生成《季度业务总表.xlsx》","生成一页简报《季度要点.docx》","完成。共处理 18 个文件，用时 1 分 05 秒（演示数据）"];
  const ol=$("#wbSteps");
  async function run(){while(true){ol.innerHTML="";for(let i=0;i<steps.length;i++){const li=document.createElement("li");li.style.cssText="display:flex;gap:10px;align-items:flex-start;padding:4px 0;animation:fadein .4s";
    li.innerHTML=`<span style="flex:none;width:20px;height:20px;border-radius:50%;border:2px solid #4fb3e8;border-top-color:transparent;animation:spin 1s linear infinite;margin-top:4px"></span><span>${steps[i]}</span>`;ol.appendChild(li);await sleep(1100);
    li.firstChild.style.cssText="flex:none;width:20px;height:20px;border-radius:50%;background:#41b883;color:#06101f;display:grid;place-items:center;font-size:12px;font-weight:900;margin-top:4px";li.firstChild.textContent="✓";
    if(i===steps.length-1)li.style.color="#7fe0b0"}await sleep(4000)}}
  onView(ol,run);
})();

/* ---------- 第一讲：猜下一个词 ---------- */
(function(){
  const BASE="银行员工必须";
  const T={"BASE": [["严格", 0.58], ["遵守", 0.18], ["依法", 0.12], ["坚持", 0.08], ["保护", 0.04]], "严格": [["遵守", 0.55], ["执行", 0.25], ["落实", 0.12], ["保护", 0.08]], "遵守": [["合规", 0.5], ["制度", 0.3], ["纪律", 0.2]], "依法": [["合规", 0.6], ["经营", 0.4]], "坚持": [["合规", 0.5], ["客户", 0.3], ["稳健", 0.2]], "保护": [["客户", 0.7], ["信息", 0.3]], "执行": [["制度", 0.6], ["规定", 0.4]], "落实": [["制度", 0.6], ["责任", 0.4]], "合规": [["经营", 0.62], ["操作", 0.25], ["展业", 0.13]], "客户": [["信息", 0.55], ["权益", 0.3], ["隐私", 0.15]], "制度": [["要求", 1]], "纪律": [["要求", 1]], "规定": [["要求", 1]], "信息": [["安全", 1]], "稳健": [["经营", 1]], "责任": [["到人", 1]]};
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

/* ---------- 名词卡片 ---------- */
(function(){const box=$("#terms");if(!box)return;const D=[["大模型", "LLM", "读过海量文本、能理解和生成语言的 AI 模型", "千问、DeepSeek 都是大模型"], ["Token", "词元", "模型处理文字的最小单位，也是计费单位", "一份 800 字的总结约消耗上千 Token"], ["提示词", "Prompt", "你交给 AI 的指令", "角色 + 任务 + 背景 + 要求 + 格式"], ["幻觉", "Hallucination", "一本正经地编造", "编出一个过时的利率或不存在的条款"], ["RAG", "知识库检索", "先查资料，再依据资料回答", "规程问答助手先查规程再作答"], ["多模态", "Multimodal", "能看图、听声、读表格", "让它解读一张模拟报表截图"], ["推理模型", "Reasoning", "先思考再回答，擅长多步分析", "政策对比、方案论证"], ["智能体", "Agent", "能调用工具、按流程把事办完", "自动汇总文件、生成报表"], ["工作流", "Workflow", "把多个步骤串起来自动执行", "录音 → 纪要 → 待办 → 提醒"], ["私有化部署", "On-premise", "模型装在行内服务器，数据不出行", "涉客、涉数的应用必须这样做"]];
  box.innerHTML=D.map((t,i)=>`<div class="term" tabindex="0"><div class="term-in"><div class="tf"><small>${String(i+1).padStart(2,"0")}</small><b>${t[0]}</b><em>${t[1]}</em><span>点击看解释 ↻</span></div><div class="tb"><b>${t[0]}</b><p>${t[2]}</p><p class="eg">例：${t[3]}</p></div></div></div>`).join("");
  box.addEventListener("click",e=>{const c=e.target.closest(".term");if(c)c.classList.toggle("flip")});})();

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
  const F=[{"k": 1, "n": "角色", "o": ["资深银行综合办公室主任", "零售客户经理培训师", "银行合规专员", "金融宣传策划"]}, {"k": 2, "n": "任务", "o": ["写一份季度工作总结", "设计一次客户回访提纲", "出 10 道制度学习练习题", "写一条反诈短视频脚本"]}, {"k": 3, "n": "背景", "o": ["我是支行零售客户经理，数据处用【待填】", "客户为稳健型，理财即将到期（已脱敏）", "我在准备行内合规知识考试", "面向社区中老年客户"]}, {"k": 4, "n": "要求", "o": ["语言朴实，少用套话", "不超过 800 字", "每题注明制度依据", "不承诺收益，提示风险"]}, {"k": 5, "n": "格式", "o": ["分“业绩—亮点—不足—计划”四部分", "用表格呈现", "选择题，附答案和解析", "分镜头脚本：镜号/画面/台词"]}];
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
  const Q=[{"q": "内部培训结束后，用千问把自己的听课录音整理成学习笔记。", "a":true, "e": "可以。公开、非敏感的培训内容可以整理。客户面谈、内部敏感会议一律不录、不上传。"}, {"q": "为了写授信报告更快，把客户的财务报表拍照发给外网 AI 分析。", "a": false, "e": "不可以。客户财务数据属于客户信息和商业秘密，严禁上传外网 AI。确需 AI 辅助，只能用行内经审批的私有化系统。"}, {"q": "用 AI 写一条反诈宣传短视频脚本，经消保和合规审核后发布。", "a":true, "e": "可以。不涉及客户信息、不承诺收益，按规定标注 AI 生成并经审核，就是合规用法。"}, {"q": "AI 生成的理财产品介绍里写着“稳健保本”，直接转发到客户群。", "a": false, "e": "不可以。理财产品不得承诺保本保收益；AI 生成的对客内容必须经合规审核后才能使用。"}, {"q": "让 AI 帮忙写 Excel 公式，用的是自己编的模拟数据。", "a":true, "e": "可以。用模拟数据把方法练熟，再在行内环境里处理真实数据。"}, {"q": "客户问一笔贷款的利率，直接把 AI 给的数字告诉客户。", "a": false, "e": "不可以。AI 的数字可能过时或编造（还记得 LPR 的例子吗？），利率以行内系统和官方公布为准。"}];
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
  const T=[{"n": "季度工作总结", "pain": "写来写去都是“认真履职、积极营销”，领导一眼看出是套话。", "code": "你是一名资深的银行综合办公室主任。请帮我写一份【岗位，如：零售客户经理】季度工作总结，约【800】字。\n\n我的真实情况（只写我自己的经历，数据我稍后自己填）：\n1. 主要工作：【……】\n2. 业绩亮点：【……，最好有一个具体做法】\n3. 不足之处：【……】\n4. 下季度计划：【……】\n\n要求：语言朴实具体，少用套话；所有数字用【待填】标出，不要编造数据；按“业绩—亮点—不足—计划”四部分。", "chk": ["所有数据由本人从行内系统核对后填写", "删掉 AI 自动添加的空话和口号", "不写入客户姓名和任何客户信息"]}, {"n": "会议纪要整理", "pain": "开完会笔记零散，整理成纪要要花一个小时。", "code": "请把下面的会议记录整理成规范的会议纪要。\n\n会议名称：【……】\n参会范围：【……（可不写具体人名）】\n原始记录：\n【粘贴录音转写或笔记，必须是非敏感会议】\n\n要求：\n1. 分为“会议主要内容”“议定事项”“工作要求”三部分；\n2. 议定事项写清楚：做什么、谁牵头、什么时间完成；\n3. 只依据原始记录整理，不补充记录里没有的内容。", "chk": ["仅限内部培训、非敏感例会", "议定事项逐条与原始记录核对", "印发前按程序报领导审核"], "warn": "涉及客户信息、经营数据、人事事项的会议内容一律不得输入"}, {"n": "汇报 PPT 大纲", "pain": "临时要做一份汇报，对着空白 PPT 不知从何下手。", "code": "你是一名擅长做工作汇报的银行管理人员。请根据以下要点，帮我设计一份【10】页左右的汇报 PPT 大纲。\n\n汇报主题：【如：网点厅堂服务提升工作汇报】\n汇报对象：【如：分行领导】\n要点：【……（不含客户信息和未公开数据）】\n\n要求：每页给出标题、3 条以内要点和建议配图；数据处用【待填】；最后一页是下一步计划。", "chk": ["口径与行内正式材料一致", "数据由本人核对后填写", "配图不使用未经授权的行徽和品牌素材"]}, {"n": "Excel 公式与报表", "pain": "知道要做什么统计，就是不会写公式、不会做透视表。", "code": "我在用 Excel 做一张【如：网点月度业务统计表】，表格结构如下（模拟数据）：\nA 列：日期；B 列：网点名称；C 列：业务类型；D 列：笔数；E 列：金额\n\n请帮我：\n1. 写出按网点、按业务类型汇总笔数和金额的公式（SUMIFS）；\n2. 告诉我怎样用数据透视表做同样的统计；\n3. 推荐一种适合汇报的图表，并说明制作步骤；\n4. 给出检查异常值的方法。", "chk": ["练习只用模拟数据", "真实数据在行内电脑上本地处理，不上传", "公式结果抽查核对"]}, {"n": "制度速读与自测", "pain": "新制度文件几十页，读完记不住重点。", "code": "下面是一份【公开的】制度文件的内容（已确认可以对外）：\n【粘贴公开制度文本】\n\n请帮我：\n1. 用 10 条以内的要点概括核心要求；\n2. 列出与【我的岗位：……】最相关的 5 条规定；\n3. 出 5 道选择题和 3 道判断题，附答案和原文依据。", "chk": ["只粘贴公开文件，内部制度不上传外网 AI", "要点与原文逐条对照", "考试以正式制度原文为准"]},{"n": "工作通知", "pain": "通知要素总是漏一样：截止时间、联系人、报送格式。", "code": "你是银行【部门】的公文秘书。请起草一份工作通知。\n\n事由：【一句话说明】\n要求事项：【逐条列出】\n截止时间：【日期】\n联系人：【职务，不写姓名】\n\n格式：标题、主送对象、正文（分条）、落款“【部门名称】”和日期。语言简洁规范，不要添加我没给的要求。", "chk": ["事项、时限与领导布置一致", "按行内发文流程审核后再发", "不写入个人手机号等联系方式"]},{"n": "营销活动方案", "pain": "活动年年办，方案年年从零写，还担心宣传用语踩线。", "code": "你是银行网点的营销策划助手。请为“【产品名称】”设计一场【厅堂/社区/企业】营销活动方案。\n\n目标客群：【如：周边社区60岁以上客户】\n预算：【金额】　时间：【日期】　人员：【人数】\n\n方案包括：活动主题、流程安排、宣传话术、物料清单、风险提示。\n合规要求：不得出现“保本”“稳赚”“无风险”“收益最高”等用语；涉及理财须提示风险。", "chk": ["宣传物料按流程送合规审核", "产品要素以行内正式材料为准", "老年客群活动注意适老化与风险提示"]},{"n": "新旧制度比对", "pain": "制度一修订就几十页，到底改了哪几条，没人说得清。", "code": "请比对下面两个版本的制度，用表格列出所有变化：条款号、旧规定、新规定、对一线操作的影响。\n只列有变化的条款，没有变化的不列；只依据原文，不要推测。\n\n旧版：\n【粘贴可外发的制度原文】\n\n新版：\n【粘贴】", "chk": ["只粘贴公开或允许外发的制度", "逐条回到原文核对", "以正式发文为准，AI 表格仅作学习参考"], "warn": "内部制度、未公开文件不上传外网 AI"},{"n": "客户应答话术", "pain": "新产品上线快，客户一问，各人说法不一样。", "code": "你是银行【柜面/厅堂/电话】服务的话术教练。客户是【客户类型，如：第一次办业务的老年客户】，他问：“【客户原话】”。\n请写两版应答话术，每版不超过120字，语气【亲切耐心/专业简洁】。\n\n要求：口语化、听得懂；不得承诺收益，不得使用“保本”“稳赚”“无风险”等用语；需要本人办理或风险评估的要说清楚。\n可参考的公开产品信息：【粘贴】", "chk": ["产品要素与行内口径一致", "不含承诺收益等违规用语", "对外使用前按流程审核"]},{"n": "投诉安抚", "pain": "客户情绪上来了，一句话说错就升级。", "code": "你是银行客服主管。客户因为“【投诉事由，不写客户信息】”情绪激动。请写一段现场安抚话术和后续处理说明。\n\n要求：先共情、再说明、后给方案；不推卸、不争辩；处理时限只写“【本行规定时限】”，不要自行承诺赔偿或补偿。", "chk": ["处理时限与行内投诉制度一致", "不擅自承诺赔偿", "按规定登记投诉"]},{"n": "电话回访脚本", "pain": "回访电话开口难，客户还常怀疑是诈骗电话。", "code": "请为“【回访目的，如：存款到期提醒】”写一份电话回访脚本，客户为【客户类型】。\n\n包括：开场自我介绍、让客户安心的说法（明确不在电话中索要密码和验证码）、核心内容、客户常见三个问题的应答、结束语。总长不超过300字。", "chk": ["不在电话中索取密码、验证码", "涉及产品推介须提示风险", "回访记录按规定留存"]},{"n": "话术合规自查", "pain": "文案写好了，自己看不出哪里踩线。", "code": "请以银行合规审查员的身份检查下面的营销话术或文案，找出所有可能违规或误导的表述，包括：承诺保本或收益、夸大宣传、“最”字类绝对化用语、未提示风险、对老年客户未提示评估。\n用表格输出：原句、问题、修改建议。最后给出修改后的完整版本。\n\n待检查内容：\n【粘贴】", "chk": ["AI 自查不能代替合规部门审核", "修改后的版本仍需人工复读"]},{"n": "授信材料清单核对", "pain": "材料缺一样就要来回退件，客户和自己都折腾。", "code": "你是银行授信业务助手。授信品种为【流动资金贷款/固定资产贷款/抵押贷款】。\n\n本行要求的材料清单：【粘贴本行清单】\n已收到的材料名称：【逐项列出，只写材料名称】\n\n请列出：1. 缺少的材料；2. 已收材料中需要核对有效期或签章的项目。只做核对，不评价企业资质。", "chk": ["只输入材料名称，不上传材料内容", "以本行最新清单为准"], "warn": "财务报表、征信、尽调内容不发外网 AI"}];
  const tabs=$("#tplTabs");tabs.innerHTML=T.map((t,i)=>`<button data-i="${i}" class="${i?"":"on"}">${t.n}</button>`).join("");
  function pick(i){const t=T[i];$$("button",tabs).forEach((b,k)=>b.classList.toggle("on",k===i));$("#tplTitle").textContent=t.n;$("#tplPain").innerHTML="😣 痛点："+t.pain;
    $("#tplCode").innerHTML=esc(t.code).replace(/【(.*?)】/g,'<span class="ph">【$1】</span>');
    $("#tplCheck").innerHTML=t.chk.map(c=>`<li>${c}</li>`).join("")+(t.warn?`<li class="warn">${t.warn}</li>`:"")}
  tabs.addEventListener("click",e=>{const b=e.target.closest("button");if(b)pick(+b.dataset.i)});pick(0);
})();

/* ---------- 第三讲：谈话陪练 ---------- */
(function(){
  const P=[{"n": "犹豫型", "d": "理财到期，拿不定主意", "c": "#4fb3e8", "s": [["u", "王先生您好，我是您的客户经理。您有一笔理财下周到期，想跟您聊聊后续安排。"], ["a", "哦……我还没想好，最近行情不太好吧？"], ["u", "理解您的顾虑。方便问一下，这笔钱近期有没有其他用途？"], ["a", "孩子明年上学可能要用一部分，其他的还没打算。"], ["u", "那我们可以分两部分考虑：近期要用的部分优先保证流动性；其余部分再根据您的风险承受能力选择。每类产品的风险我都会讲清楚，您考虑好了再决定。"], ["r", "AI 点评（模拟）\n✓ 先了解资金用途，再谈产品，符合适当性要求\n✓ 主动说明会讲清风险，不催促决定\n→ 建议：介绍具体产品时出示风险等级，按规定完成双录\n需求挖掘 9 ｜ 风险揭示 8 ｜ 合规底线 9 ｜ 共情 8"]]}, {"n": "追问收益型", "d": "只问哪个最高、能不能保本", "c": "#d6ad55", "s": [["a", "你就直说吧，哪个产品收益最高？能保本吗？"], ["u", "理解您希望收益好一些。但理财产品都不承诺保本保收益，过往业绩也不代表未来表现。"], ["a", "那我存着有什么意思？别的银行都说能到 5 个点。"], ["u", "每家产品的风险和期限都不一样。我先帮您做一下风险测评，再把适合您的几类产品的风险等级、期限、费用都列清楚，您比较之后再决定。"], ["a", "行吧，那你给我讲讲。"], ["r", "AI 点评（模拟）\n✓ 守住了“不承诺保本收益”的红线\n✓ 用风险测评把对话拉回适当性流程\n→ 提醒：不贬低同业，不引用未经核实的收益数字\n需求挖掘 7 ｜ 风险揭示 10 ｜ 合规底线 10 ｜ 共情 7"]]}, {"n": "投诉情绪型", "d": "对扣费不满，情绪激动", "c": "#e0574f", "s": [["a", "你们怎么又扣我钱？这个费到底是什么费？！"], ["u", "非常抱歉给您带来困扰。您先别着急，我马上帮您查一下这笔费用的具体项目。"], ["a", "上次就说会处理，结果还是扣了！"], ["u", "您之前反映过，这次没解决好确实是我们的问题。我现在把扣费明细和收费依据给您说清楚；如果确实有误，按流程为您处理，并在今天下班前给您回电。"], ["a", "……好，那你今天一定给我回复。"], ["r", "AI 点评（模拟）\n✓ 先安抚情绪，再查明事实\n✓ 给出明确的回复时限，不做职责外承诺\n→ 建议：按消保投诉流程登记，处理结果留痕\n共情 9 ｜ 问题定位 8 ｜ 合规底线 9 ｜ 承诺管理 9"]]}];
  const pb=$("#persona");let cur=0,playing=0;
  pb.innerHTML=P.map((p,i)=>`<button data-i="${i}" class="${i?"":"on"}" style="color:var(--paper-ink);border-color:${i?"#cfc6b2":"var(--gold)"}"><span class="av" style="background:${p.c}22;color:${p.c}"><svg width="26" height="26"><use href="#i-talk"/></svg></span><span><b>${p.n}客户</b><small style="color:var(--paper-ink-2)">${p.d}</small></span></button>`).join("");
  const body=$("#chatBody");
  function reset(){playing++;body.innerHTML=`<div class="msg sys">虚构演示 · ${P[cur].n}客户 · 点击“播放对练”</div>`;$("#chatTitle").textContent=`沟通陪练 · ${P[cur].n}客户`}
  async function play(){const my=++playing;body.innerHTML=`<div class="msg sys">AI 已进入角色：${P[cur].n}客户（虚构）</div>`;
    for(const [w,t] of P[cur].s){if(my!==playing)return;
      const m=document.createElement("div");m.className="msg "+(w==="u"?"u":w==="a"?"a":"review");
      if(w!=="u"){m.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';body.appendChild(m);body.scrollTop=body.scrollHeight;await sleep(900);if(my!==playing)return}
      else body.appendChild(m);
      const who=w==="u"?"客户经理（学员）":w==="a"?"客户（AI 扮演）":"";
      m.innerHTML=who?`<span class="who">${who}</span>`:"";const span=document.createElement("span");m.appendChild(span);
      for(let i=1;i<=t.length;i+=2){span.textContent=t.slice(0,i);body.scrollTop=body.scrollHeight;await sleep(w==="r"?14:28);if(my!==playing)return}
      span.textContent=t;body.scrollTop=body.scrollHeight;await sleep(650)}}
  pb.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;cur=+b.dataset.i;$$("button",pb).forEach((x,k)=>{x.classList.toggle("on",k===cur);x.style.borderColor=k===cur?"var(--gold)":"#cfc6b2"});reset();setPrompt()});
  $("#chatPlay").onclick=play;$("#chatReset").onclick=reset;reset();onView(body,play);
  function setPrompt(){$("#coachPrompt").innerHTML=esc(`你现在是一个用于银行员工沟通能力训练的模拟客户。

请扮演：一位【${P[cur].n}】客户（完全虚构，不对应任何真实个人）。
背景：【虚构背景，如：40多岁，稳健型，一笔理财即将到期】

规则：
1. 每次只说一两句话，像真实对话一样；
2. 根据我的沟通方式调整态度：我专业、真诚、讲清风险，你逐步信任；我夸大收益、催促成交，你更加怀疑；
3. 不要主动跳出角色；
4. 当我输入“结束”，请跳出角色，从“需求挖掘、风险揭示、合规底线、共情”四个方面各打 10 分制分数，指出我有没有说出违规话术，并给出改进建议。

现在开始，你先开口。`).replace(/【(.*?)】/g,'<span class="ph">【$1】</span>')}
  setPrompt();
})();

/* ---------- 休息倒计时 ---------- */
(function(){if(!document.getElementById("clock"))return;
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
  const A=[["i-book", "业务规程问答助手", "柜面 / 运营：依据公开产品说明和操作规程作答，并给出出处。", "业务问题", "答案 + 规程出处", "公开产品说明、操作规程", "不处理客户信息；查不到依据就说不知道"], ["i-talk", "客户沟通陪练员", "零售客户经理 / 理财经理：模拟不同客户，练需求挖掘与风险揭示。", "客户类型 + 你的话术", "角色回应 + 四维度评分", "沟通技巧、公开的适当性要求", "客户角色完全虚构"], ["i-team", "行业研究助手", "对公客户经理：汇总公开行业资讯与政策，生成拜访提纲。", "行业 / 地区", "行业简报、拜访提纲", "公开资讯、政策文件", "不输入客户财务数据"], ["i-list", "授信材料核对助手", "信贷：检查材料清单是否齐全、前后表述是否一致。", "材料清单（行内系统内）", "缺漏与不一致提示", "行内授信制度", "只做核对提示，不做审批结论；须行内部署"], ["i-shield", "营销文案合规初审员", "风控合规 / 宣传：标出违规表述，提示缺失的风险提示语。", "营销文案、视频脚本", "问题清单 + 修改建议", "监管规定、行内宣传规范", "只做初审，最终以合规审核为准"], ["i-pen", "公文与会务助手", "办公室：通知起草、会议安排、纪要整理。", "要点 / 录音转写", "公文草稿、纪要、待办", "公文格式规范", "不处理涉密和人事文件"], ["i-heart", "客服标准问答", "客服：常见问题检索，按标准话术生成回复。", "客户问题（不含身份信息）", "标准话术回复", "公开 FAQ、服务规范", "不承诺、不越权；复杂问题转人工"], ["i-graduate", "新员工学习教练", "人力 / 培训：制度出题、批改、整理错题本。", "学习范围", "练习题、解析、错题本", "公开制度与培训教材", "以正式制度原文为准"], ["i-gear", "管理者经营助手", "行长 / 管理者：汇报提炼、会议材料、政策速读。", "脱敏后的汇总数据、公开政策", "要点摘要、汇报提纲", "行内统计口径", "涉及经营数据须用行内部署的系统"]];
  const box=$("#agents");
  box.innerHTML=A.map((a,i)=>`<div class="ag-card rv d${i%4}"><div class="ag-in"><div class="ag-f"><div class="em"><svg><use href="#${a[0]}"/></svg></div><h4>${a[1]}</h4><p>${a[2]}</p><span class="flip-hint">点击翻面 ↻</span></div>
    <div class="ag-b"><h4 style="color:var(--gold-2);margin-bottom:10px">${a[1]}</h4><dl><dt>输入</dt><dd>${a[3]}</dd><dt>输出</dt><dd>${a[4]}</dd><dt>知识</dt><dd>${a[5]}</dd><dt>红线</dt><dd class="r">${a[6]}</dd></dl></div></div></div>`).join("");
  $$(".ag-card",box).forEach(c=>{observe(c);c.onclick=()=>c.classList.toggle("flip")});
})();

/* ---------- 第四讲：开发演示 ---------- */
(function(){
  $("#specText").textContent=`请帮我开发一个“营销文案合规初审员”网页应用。

【使用者】银行网点员工、宣传与合规岗位，在提交审核前自查营销文案和短视频脚本。

【功能】
1. 粘贴一段文案，逐条找出违规或高风险表述（如承诺保本保收益、片面强调收益、贷款“低门槛”“秒到账”等）；
2. 检查是否缺少风险提示语、产品风险等级等必备要素；
3. 每条问题给出依据（规定名称 + 条款）和修改建议；
4. 输出“通过 / 不通过”的初审结论，并提醒“须经合规部门最终审核”。

【规则库】只使用我提供的公开监管规定和公开的宣传规范。

【安全要求】不保存用户输入；检测到身份证号、卡号、手机号等客户信息时，提示用户先脱敏。

【界面】简洁，手机可用，深蓝色主题。

【技术】请你选择合适的技术方案，写好代码、测试和运行说明。`;
  const TERM=["$ 在项目文件夹中启动 Claude / Codex", "› 请阅读 需求说明.md 并开始开发", "", "● 读取 需求说明.md … 已理解 4 项功能、2 项安全要求", "● 方案：网页前端 + 规则比对 + 大模型解释", "  + 新建 app/index.html        初审界面（深蓝主题，适配手机）", "  + 新建 app/server.py         后端服务", "  + 新建 app/rules.py          禁用表述与必备要素规则库", "  + 新建 app/prompts.py        角色设定：逐条给依据和修改建议", "  + 新建 app/guard.py          客户信息检测与脱敏提醒", "  + 新建 app/report.py         初审报告", "  + 新建 README.md             运行说明", "● 运行测试 …", "  ✓ 含“保本”的文案：识别并给出依据", "  ✓ 缺少风险提示：提示补充", "  ✓ 含身份证号：提醒先脱敏", "● 已启动本地预览：http://localhost:8000"];
  const KB=["金融产品网络营销管理办法.pdf", "商业银行理财业务监督管理办法.pdf", "银行保险机构消费者权益保护管理办法.pdf", "中华人民共和国广告法.pdf", "行内宣传规范（公开版）.pdf", "风险提示语模板.pdf"];
  const urls=["需求说明.md","终端 · Claude / Codex","规则库 · 上传文档","http://localhost:8000","部署方案"];
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
  const SHOTS=[["0–8s", "手机来电界面：陌生“客服”来电", "“您好，我是某平台客服，您的账户有异常……”"], ["8–18s", "来电者语速很快，屏幕弹出验证码短信", "骗子第一招：冒充客服，制造紧张。"], ["18–30s", "红色“禁”字印章盖在验证码上", "识破一：验证码、密码，任何人要都不给。"], ["30–42s", "可疑链接被替换成警示色块", "识破二：陌生链接不点，屏幕共享不开。"], ["42–52s", "环形流程：挂断—官方渠道核实—报警", "识破三：挂断电话，打官方客服或 96110 核实。"], ["52–60s", "盾牌标识与标语定格", "守好钱袋子，反诈靠大家。本视频含 AI 生成内容。"]];
  const S=[
    {n:"选题",i:"i-bulb",sm:"AI 出点子",tools:["千问","DeepSeek","豆包"],d:"把目的、对象、时长告诉 AI，让它给出多个选题，人来挑。",
     p:"我要为银行网点制作一条 60 秒竖屏反诈宣传短视频，观众是社区中老年客户，风格亲切、好懂。请给出 5 个选题，每个附一句话说明亮点。",
     o:()=>`<h4 style="margin-bottom:10px">AI 给出的 5 个选题</h4>`+["《三招识破“冒充客服”诈骗》","《验证码就是你的钱》","《“刷单返利”都是坑》","《陌生链接不要点》","《养老钱，守住它》"].map((t,k)=>`<div style="padding:10px 14px;border-radius:10px;margin:6px 0;${k===0?"background:var(--gold);color:var(--navy-0);font-weight:700":"background:rgba(255,255,255,.04)"}">${k===0?"✓ ":""}${t}</div>`).join("")},
    {n:"脚本分镜",i:"i-list",sm:"AI 写脚本",tools:["千问","DeepSeek"],d:"选定题目后，让 AI 按秒数写分镜脚本：每个镜头的画面和旁白一一对应。",
     p:"请为《三招识破“冒充客服”诈骗》写 60 秒分镜脚本，共 6 个镜头。用表格输出：镜号、时长、画面描述、旁白。画面中不出现真实客户和银行标识，旁白每镜不超过 25 字。",
     o:()=>`<table class="script-t"><tr><th>镜</th><th>时长</th><th>画面</th><th>旁白</th></tr>${SHOTS.map((r,k)=>`<tr><td>${k+1}</td><td style="white-space:nowrap">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table>`},
    {n:"生成画面",i:"i-img",sm:"文生图 / 图生视频",tools:["即梦","可灵","通义万相"],d:"每个镜头先用文字生成关键画面，再让画面“动起来”。提示词越具体，画面越可控。",
     p:"【镜头1 · 文生图】一部放在餐桌上的手机，屏幕显示陌生来电，温暖的家居背景，扁平卡通插画风格，竖构图 9:16，无真实人物，无品牌标识。\n\n【镜头1 · 图生视频】手机屏幕亮起并轻微震动，镜头缓慢推近，时长 5 秒。",
     o:()=>`<h4 style="margin-bottom:10px">6 个镜头的关键画面（示意）</h4><div class="sb">${SHOTS.map((r,k)=>`<figure><svg viewBox="0 0 160 90">${scene(k,160,90)}</svg><figcaption>镜 ${k+1} · ${r[0]}</figcaption></figure>`).join("")}</div>`},
    {n:"配音",i:"i-mic",sm:"AI 配音 / 数字人",tools:["剪映 AI 配音","千问","豆包"],d:"把旁白交给 AI 配音，选择音色、调整语速和停顿。需要出镜讲解时，可用授权的数字人形象。",
     p:"配音稿（女声，亲切，语速 0.95 倍，句间停顿 0.5 秒）：\n您好，我是某平台客服，您的账户有异常……\n骗子第一招：冒充客服，制造紧张。\n……\n守好钱袋子，反诈靠大家。",
     o:()=>`<h4>音色：亲切女声 · 语速 0.95×</h4><div class="wave" style="margin:16px 0">${Array.from({length:48},(_,k)=>`<i style="animation-delay:${(k%12)*.07}s"></i>`).join("")}</div><p style="color:var(--ink-2);font-size:14.5px">▶ 您好，我是某平台客服……</p><p style="font-size:13.5px;color:#ff9d96;margin-top:10px">⚠ 不使用真实人物的声音和形象进行克隆。</p>`},
    {n:"剪辑字幕",i:"i-cut",sm:"一键成片",tools:["剪映"],d:"把画面、配音、音乐拖进时间线，自动识别字幕，加上片头片尾和“AI 生成”标识。",
     p:"剪辑要点：\n1. 画面按配音节奏卡点；\n2. 自动识别字幕，逐句校对错别字；\n3. 背景音乐选用有版权授权的曲目；\n4. 片头或角标添加“AI 生成”标识。",
     o:()=>`<h4 style="margin-bottom:6px">剪辑时间线</h4><div class="edit-tl playhead">${[["视频",SHOTS.map((s,k)=>[`镜${k+1}`,"#3a5a94",[8,10,12,12,10,8][k]])],["配音",[["旁白",'#b8892a',60]]],["字幕",SHOTS.map((s,k)=>[s[2].slice(0,6),"#2f7d5c",[8,10,12,12,10,8][k]])],["音乐",[["背景音乐（已授权）","#6a4c93",60]]]].map(([l,cl])=>`<div class="lbl">${l}</div><div class="trk">${cl.map(c=>`<span style="flex:${c[2]};background:${c[1]}">${c[0]}</span>`).join("")}</div>`).join("")}</div>`},
    {n:"审核发布",i:"i-send",sm:"人工把关",tools:["宣传部门审核"],d:"最后一步只能由人来做：逐项核对后按程序审批，再发布。",
     p:"发布前审核清单：\n□ 无真实客户及其可识别信息\n□ 无承诺收益、夸大宣传表述\n□ 已标注“AI 生成”\n□ 字幕、数据、法条准确\n□ 音乐、字体、素材有授权\n□ 已经消保与合规部门审核",
     o:()=>`<h4 style="margin-bottom:8px">审核清单</h4><ul class="checklist" style="color:var(--ink)">${["无真实客户及其可识别信息","无承诺收益、夸大宣传表述","已标注“AI 生成”","字幕、数据、法条准确","音乐、字体、素材有授权","已经消保与合规部门审核"].map((t,k)=>`<li style="border-color:var(--line);opacity:0;animation:fadein .4s ${k*.35}s forwards">${t}</li>`).join("")}</ul>`}];
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
