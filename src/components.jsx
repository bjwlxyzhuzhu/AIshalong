import React,{useEffect,useRef,useState} from 'react';
import {NAV} from './data.js';

export function Bi({cn,en,className=''}){return <span className={className}>{cn}<span className="en">{en}</span></span>}

export function Layout({page,children}){
  const [open,setOpen]=useState(false);
  return <><nav className="site-nav"><div className="nav-inner"><a className="brand" href="index.html"><span className="brand-mark">N</span><span>NexAI创新工坊<small>NexAI Innovation Workshop</small></span></a><button className="nav-toggle" aria-label="打开导航 Open navigation" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>☰</button><div className={'nav-links '+(open?'open':'')}>{NAV.map(n=><a key={n[0]} href={n[1]} className={page===n[0]?'active':''}>{n[2]}<span>{n[3]}</span></a>)}</div></div></nav><main className="page-shell">{children}</main><footer className="footer"><div className="wrap footer-inner"><p>NexAI创新工坊线下沙龙（江苏大学站）<span className="en">NexAI Innovation Workshop · Jiangsu University</span></p><p><a href="downloads.html">软件下载 Downloads</a> · <a href="concepts.html">概念图谱 Concepts</a></p></div></footer></>
}

export function PageHero({code,title,en,desc,descEn}){return <header className="page-hero"><div className="wrap page-hero-grid"><div><h1>{title}<span className="en">{en}</span></h1><p>{desc}<span className="en">{descEn}</span></p></div><div className="page-code">{code}</div></div></header>}

export function TiltLink({href,n,title,en,desc,descEn,external=false}){
  const ref=useRef(null);
  const move=e=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches){const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;e.currentTarget.style.setProperty('--rx',(-y*4)+'deg');e.currentTarget.style.setProperty('--ry',(x*5)+'deg');e.currentTarget.style.setProperty('--mx',(x*100+50)+'%');e.currentTarget.style.setProperty('--my',(y*100+50)+'%')}};
  const leave=e=>{e.currentTarget.style.setProperty('--rx','0deg');e.currentTarget.style.setProperty('--ry','0deg')};
  return <a ref={ref} className="quick-link react-tilt" href={href} onPointerMove={move} onPointerLeave={leave} target={external?'_blank':undefined} rel={external?'noopener':undefined}><span className="n">{n}</span><h3>{title}<span className="en">{en}</span></h3><p>{desc}<span className="en">{descEn}</span></p></a>
}

export function Reveal({children,className=''}){
  const ref=useRef(null);useEffect(()=>{const el=ref.current;if(!el)return;if(!('IntersectionObserver'in window)){el.classList.add('in');return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.1});io.observe(el);return()=>io.disconnect()},[]);
  return <div ref={ref} className={'reveal '+className}>{children}</div>
}

export function Shot({src,alt,cn,en,wide=false,onOpen}){return <figure className={'shot '+(wide?'wide':'')}><button onClick={()=>onOpen(src,alt)} aria-label={'放大截图 '+alt}><img src={src} alt={alt} loading="lazy"/></button><figcaption>{cn}<span className="en">{en}</span></figcaption></figure>}

export function Lightbox({item,onClose}){
  useEffect(()=>{if(!item)return;const key=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',key);document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=''}},[item,onClose]);
  if(!item)return null;return <div className="lightbox open" role="dialog" aria-modal="true" aria-label="截图放大预览" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><button onClick={onClose} aria-label="关闭 Close">×</button><img src={item.src} alt={item.alt}/></div>
}

const CONCEPT_NODES=[
  {id:'LLM',full:'Large Language Model',cn:'大语言模型',p:[0,1.6,0],c:0x245b87},
  {id:'Agent',full:'AI Agent',cn:'人工智能智能体',p:[0,0,0],c:0xf26a32},
  {id:'API',full:'Application Programming Interface',cn:'应用程序编程接口',p:[-2.6,.2,.5],c:0x3c8590},
  {id:'MCP',full:'Model Context Protocol',cn:'模型上下文协议',p:[2.6,.2,.5],c:0x3c8590},
  {id:'Skills',full:'Reusable Skills',cn:'可复用技能',p:[-2.1,-1.65,-.2],c:0x3d806b},
  {id:'RAG',full:'Retrieval-Augmented Generation',cn:'检索增强生成',p:[2.1,-1.65,-.2],c:0x736a9a},
  {id:'Tokens',full:'Model Input / Output Units',cn:'模型输入输出计量单位',p:[0,-2.3,.4],c:0x245b87},
  {id:'Harness',full:'Agent Runtime Harness',cn:'智能体运行框架',p:[3.15,1.72,-.3],c:0xc94c1c}
];
const CONCEPT_LINKS=[[0,1],[1,2],[1,3],[1,4],[1,5],[0,6],[1,7],[2,0],[3,0],[3,4],[5,0],[7,2],[7,3]];
const API_NODES=[
  {id:'Task',full:'User Task',cn:'用户任务',p:[-3,0,0],c:0x245b87},{id:'Agent',full:'AI Agent',cn:'人工智能智能体',p:[-1.5,0,0],c:0xf26a32},{id:'TokenOne',full:'Unified API Gateway',cn:'统一API网关',p:[0,0,0],c:0x3c8590},
  {id:'DeepSeek',full:'Language Model Group',cn:'语言模型分组',p:[1.8,1.5,0],c:0x245b87},{id:'Image',full:'Image Generation Models',cn:'生图模型分组',p:[2.3,.25,0],c:0x3d806b},{id:'Codex',full:'OpenAI Codex Group',cn:'Codex模型分组',p:[1.8,-1.15,0],c:0xf26a32},{id:'Claude',full:'Claude Model Group',cn:'Claude模型分组',p:[.7,-2.1,0],c:0x736a9a},{id:'Output',full:'Tools & Deliverables',cn:'工具与最终成果',p:[3.5,-1.4,-.5],c:0xc94c1c}
];
const API_LINKS=[[0,1],[1,2],[2,3],[2,4],[2,5],[2,6],[3,7],[4,7],[5,7],[6,7]];

export function ThreeNetwork({mode='concept'}){
  const mount=useRef(null),[hover,setHover]=useState(null);const nodes=mode==='concept'?CONCEPT_NODES:API_NODES,links=mode==='concept'?CONCEPT_LINKS:API_LINKS;
  useEffect(()=>{let alive=true,cleanup=()=>{};(async()=>{const THREE=await import('three');const {CSS2DRenderer,CSS2DObject}=await import('three/addons/renderers/CSS2DRenderer.js');if(!alive||!mount.current)return;const host=mount.current,scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(44,host.clientWidth/host.clientHeight,.1,100);camera.position.set(0,0,host.clientWidth<600?12:9);const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;host.appendChild(renderer.domElement);const labels=new CSS2DRenderer();labels.setSize(host.clientWidth,host.clientHeight);labels.domElement.className='three-labels';host.appendChild(labels.domElement);scene.add(new THREE.AmbientLight(0xffffff,2.2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(4,5,7);scene.add(light);const group=new THREE.Group();scene.add(group);const meshes=[];nodes.forEach((n,i)=>{const g=new THREE.SphereGeometry(.28,32,24),m=new THREE.MeshStandardMaterial({color:n.c,roughness:.32,metalness:.08,emissive:n.c,emissiveIntensity:.08});const mesh=new THREE.Mesh(g,m);mesh.position.set(...n.p);mesh.userData={index:i};group.add(mesh);meshes.push(mesh);const div=document.createElement('div');div.className='three-label';div.innerHTML='<b>'+n.id+'</b><small>'+n.cn+'<br>'+n.full+'</small>';const lab=new CSS2DObject(div);lab.position.set(0,.52,0);mesh.add(lab)});links.forEach(([a,b])=>{const pts=[new THREE.Vector3(...nodes[a].p),new THREE.Vector3(...nodes[b].p)],geo=new THREE.BufferGeometry().setFromPoints(pts),mat=new THREE.LineBasicMaterial({color:0x69849a,transparent:true,opacity:.5});group.add(new THREE.Line(geo,mat))});const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(9,9);let px=0,py=0,raf;const onMove=e=>{const r=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;px=pointer.x;py=pointer.y};const onLeave=()=>{pointer.set(9,9);setHover(null)};renderer.domElement.addEventListener('pointermove',onMove,{passive:true});renderer.domElement.addEventListener('pointerleave',onLeave);const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches,started=performance.now();const draw=()=>{const t=(performance.now()-started)/1000;if(!reduced){group.rotation.y+=(px*.16-group.rotation.y)*.025;group.rotation.x+=(-py*.08-group.rotation.x)*.025;meshes.forEach((m,i)=>m.scale.setScalar(1+Math.sin(t*1.4+i)*.035))}ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(meshes)[0];meshes.forEach(m=>{m.material.emissiveIntensity=hit&&hit.object===m?.38:.08});setHover(prev=>{const next=hit?nodes[hit.object.userData.index]:null;return prev?.id===next?.id?prev:next});renderer.render(scene,camera);labels.render(scene,camera);raf=requestAnimationFrame(draw)};draw();const resize=()=>{if(!host.clientWidth)return;camera.aspect=host.clientWidth/host.clientHeight;camera.position.z=host.clientWidth<600?12:9;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);labels.setSize(host.clientWidth,host.clientHeight)};addEventListener('resize',resize,{passive:true});cleanup=()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointermove',onMove);renderer.domElement.removeEventListener('pointerleave',onLeave);renderer.dispose();host.replaceChildren()}})();return()=>{alive=false;cleanup()}},[mode]);
  return <div className="three-shell"><div className="three-canvas" ref={mount}/><div className={'three-hint '+(hover?'show':'')}>{hover?<><b>{hover.id} · {hover.cn}</b><span>{hover.full}</span></>:<><b>拖动视线，探索关系</b><span>Move the pointer to explore relationships</span></>}</div></div>
}
