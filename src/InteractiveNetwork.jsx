import React, {useEffect, useRef, useState} from 'react';

const TERMS = [
  {id:'LLM', full:'Large Language Model', cn:'大语言模型', p:[0,1.85,0], c:0x245b87, text:'模型负责理解和生成内容。智能体调用模型来推理；Tokens 衡量输入输出；RAG 可以补充外部资料。', en:'The model understands and generates content. Agents call it to reason, tokens measure its input and output, and RAG supplies external sources.'},
  {id:'Agent', full:'Artificial Intelligence Agent', cn:'人工智能智能体', p:[0,0,0], c:0xf26a32, text:'智能体围绕目标规划步骤，调用模型与工具，再检查结果。Skills、MCP 和运行框架帮助它把任务落到实处。', en:'An agent plans around a goal, calls models and tools, and checks results. Skills, MCP, and a runtime harness support execution.'},
  {id:'API', full:'Application Programming Interface', cn:'应用程序编程接口', p:[-2.85,.35,.2], c:0x3c8590, text:'API 是软件之间的调用接口。智能体通过它向模型或服务发送请求，接收结果；API 密钥用于身份验证。', en:'An API is an interface between applications. Agents use it to request models or services and receive results; an API key authenticates access.'},
  {id:'MCP', full:'Model Context Protocol', cn:'模型上下文协议', p:[2.85,.35,.2], c:0x3c8590, text:'MCP 为智能体连接工具和数据提供统一协议。它通常连接外部工具与资料，并不等同于模型 API。', en:'MCP standardizes how agents connect to tools and data. It usually links external tools and sources, and is distinct from a model API.'},
  {id:'Skills', full:'Reusable Agent Skills', cn:'可复用智能体技能', p:[-2.65,-1.65,0], c:0x3d806b, text:'技能把操作方法、参考资料和脚本打包成可复用流程。智能体按任务需要加载，帮助保持输出标准。', en:'Skills package instructions, references, and scripts into reusable workflows. Agents load them as needed to maintain output standards.'},
  {id:'RAG', full:'Retrieval-Augmented Generation', cn:'检索增强生成', p:[2.65,-1.65,0], c:0x736a9a, text:'先检索相关资料，再把资料提供给模型生成回答。资料来源与引用仍需核验，检索并不能自动保证结论正确。', en:'Retrieve relevant sources first, then supply them to the model. Sources and citations still need verification; retrieval does not guarantee correctness.'},
  {id:'Tokens', full:'Tokens (not an acronym)', cn:'词元：模型处理与计费的单位', p:[0,-2.65,.2], c:0x245b87, text:'Token 是文本等输入的切分单位，并不是固定的字或词。输入、输出和缓存用量可按不同费率计费。', en:'A token is a unit of encoded input, not a fixed word or character. Input, output, and cached usage may have different billing rates.'},
  {id:'Harness', full:'Agent Runtime Harness', cn:'智能体运行框架', p:[2.85,2.05,-.2], c:0xc94c1c, text:'运行框架组织上下文、模型调用、工具执行、权限与结果检查。它使模型能够在受控的环境里连续完成任务。', en:'A harness organizes context, model calls, tool execution, permissions, and checks so a model can work through tasks in a controlled environment.'}
];
const TERM_LINKS = [[0,1],[0,2],[0,5],[0,6],[1,2],[1,3],[1,4],[1,7],[3,7],[4,7]];
const ROUTE = [
  {id:'Task',full:'User Task',cn:'用户任务',p:[-3.3,1.7,0],c:0x245b87,text:'先提供任务目标、参考模板、素材和验收标准。',en:'Start with a goal, a reference template, materials, and acceptance criteria.'},
  {id:'Agent',full:'Artificial Intelligence Agent',cn:'智能体客户端',p:[-3.3,-.05,0],c:0xf26a32,text:'智能体客户端规划任务，通过 API 请求模型，调用工具并检查成果。',en:'The agent client plans the task, requests models via an API, invokes tools, and checks deliverables.'},
  {id:'TokenOne',full:'Third-party API Gateway',cn:'第三方 API 网关',p:[-.85,.85,0],c:0x3c8590,text:'网关负责密钥、模型分组、请求路由与用量记录。实际可调用的模型和协议，以控制台当前支持项为准。',en:'The gateway manages keys, model groups, request routing, and usage records. Available models and protocols depend on current console support.'},
  {id:'DeepSeek',full:'DeepSeek Model Group',cn:'DeepSeek 语言模型',p:[1.8,2.25,0],c:0x245b87,text:'选择 DeepSeek 分组与模型，通过 API 处理文本、推理或代码任务。',en:'Select a DeepSeek group and model for text, reasoning, or coding requests through its API.'},
  {id:'Image',full:'Image Generation Models',cn:'生图模型',p:[2.85,.75,0],c:0x3d806b,text:'支持的生图模型也可以通过 API 调用；按模型要求提供提示词、尺寸或参考图，使用兼容的工具接收图片。',en:'Supported image models can be called via an API. Supply the required prompt, size, or reference image, and use a compatible tool to receive the image.'},
  {id:'Codex',full:'Models for the Codex Client',cn:'Codex 对应模型分组',p:[1.8,-.8,0],c:0xf26a32,text:'为 Codex 客户端选择兼容的模型与接口分组，并通过 CC Switch 配置。Codex 是智能体产品，不是 API 协议名称。',en:'Choose a compatible model and endpoint group for the Codex client and configure it with CC Switch. Codex is an agent product, not an API protocol.'},
  {id:'Claude',full:'Claude Model Group',cn:'Claude 模型分组',p:[-.45,-1.85,0],c:0x736a9a,text:'为 Claude 客户端选择兼容的 Claude 模型分组；配置与账号要求以客户端当前支持方式为准。',en:'Choose a compatible Claude model group for the client. Configuration and account requirements depend on the client’s current capabilities.'},
  {id:'Output',full:'Tools & Verified Deliverables',cn:'工具执行与验收成果',p:[-3.3,-2.2,0],c:0xc94c1c,text:'模型返回结果后，由智能体继续执行工具并整合文件；最终检查文件是否能打开、内容是否准确、需求是否满足。',en:'After receiving model output, the agent continues tool execution and assembles files. Check that files open, facts are accurate, and requirements are met.'}
];
const ROUTE_LINKS = [[0,1],[1,2],[2,3],[2,4],[2,5],[2,6],[1,7]];

export function ThreeNetwork({mode='concept', compact=false}) {
  const nodes = mode==='api' ? ROUTE : TERMS;
  const links = mode==='api' ? ROUTE_LINKS : TERM_LINKS;
  const [selected,setSelected] = useState(mode==='api'?'TokenOne':'LLM');
  const [ready,setReady] = useState(false);
  const [failed,setFailed] = useState(false);
  const [replay,setReplay] = useState(0);
  const mount=useRef(null), engine=useRef(null);
  const selectedRef=useRef(selected);
  selectedRef.current=selected;
  const active=nodes.find(n=>n.id===selected)||nodes[0];

  useEffect(()=>{engine.current?.select(selected)},[selected,replay]);
  useEffect(()=>{
    let alive=true, cleanup=()=>{};
    setReady(false);setFailed(false);
    (async()=>{
      const [THREE,{CSS2DRenderer,CSS2DObject},{OrbitControls}]=await Promise.all([
        import('three'),import('three/addons/renderers/CSS2DRenderer.js'),import('three/addons/controls/OrbitControls.js')
      ]);
      if(!alive||!mount.current)return;
      const host=mount.current;
      const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(42,1,.1,100);
      const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.domElement.setAttribute('aria-label','可拖动的关系图 / Draggable relationship map');
      host.appendChild(renderer.domElement);
      const labels=new CSS2DRenderer();labels.domElement.className='three-labels';host.appendChild(labels.domElement);
      const controls=new OrbitControls(camera,renderer.domElement);
      controls.enablePan=false;controls.enableZoom=false;
      controls.enableDamping=!reduced;controls.dampingFactor=.09;
      controls.rotateSpeed=.55;controls.minPolarAngle=Math.PI*.32;controls.maxPolarAngle=Math.PI*.68;
      controls.minAzimuthAngle=-.65;controls.maxAzimuthAngle=.65;
      scene.add(new THREE.AmbientLight(0xffffff,2.3));
      const light=new THREE.DirectionalLight(0xffffff,2.1);light.position.set(3,4,8);scene.add(light);
      const group=new THREE.Group();scene.add(group);
      const sphere=new THREE.SphereGeometry(.22,24,16);
      const packetGeo=new THREE.SphereGeometry(.052,10,8);
      const meshes=[],buttons=[],edges=[];
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.02,8,48),new THREE.MeshBasicMaterial({color:0xf26a32,transparent:true,opacity:.9}));group.add(ring);
      nodes.forEach((n,i)=>{
        const material=new THREE.MeshStandardMaterial({color:n.c,roughness:.4,metalness:.12,transparent:true,emissive:n.c,emissiveIntensity:.12});
        const mesh=new THREE.Mesh(sphere,material);mesh.position.set(...n.p);mesh.userData.index=i;group.add(mesh);meshes.push(mesh);
        const button=document.createElement('button');button.type='button';button.className='three-label';button.tabIndex=-1;
        button.addEventListener('pointerdown',event=>event.preventDefault());
        button.innerHTML='<b>'+n.id+'</b><small>'+n.cn+'</small>';
        button.setAttribute('aria-label',n.cn+' / '+n.full);button.setAttribute('aria-pressed','false');
        button.addEventListener('click',()=>{setSelected(n.id);setReplay(v=>v+1)});
        const label=new CSS2DObject(button);label.position.set(0,.43,0);mesh.add(label);buttons.push(button);
      });
      links.forEach(([a,b],i)=>{
        const start=new THREE.Vector3(...nodes[a].p),end=new THREE.Vector3(...nodes[b].p);
        const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([start,end]),new THREE.LineBasicMaterial({color:0x69849a,transparent:true,opacity:.28}));
        const packet=new THREE.Mesh(packetGeo,new THREE.MeshBasicMaterial({color:0xf26a32}));
        group.add(line,packet);edges.push({a,b,start,end,line,packet,offset:i*.19,active:false});
      });
      let activeIndex=0,started=performance.now(),raf=0,onScreen=true,hidden=document.hidden;
      const select=id=>{
        activeIndex=Math.max(0,nodes.findIndex(n=>n.id===id));started=performance.now();
        const related=new Set([activeIndex]);
        edges.forEach(e=>{e.active=e.a===activeIndex||e.b===activeIndex;if(e.active){related.add(e.a);related.add(e.b)}e.line.material.color.setHex(e.active?0xf26a32:0x69849a);e.line.material.opacity=e.active?.8:.16;e.packet.visible=e.active&&!reduced});
        meshes.forEach((m,i)=>{m.material.opacity=related.has(i)?1:.32;m.material.emissiveIntensity=i===activeIndex?.38:.08;buttons[i].classList.toggle('is-selected',i===activeIndex);buttons[i].classList.toggle('is-muted',!related.has(i));buttons[i].setAttribute('aria-pressed',String(i===activeIndex));});
        ring.position.copy(meshes[activeIndex].position);drawFrame(performance.now());
      };
      const fit=()=>{
        const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
        camera.aspect=width/height;
        const fov=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
        const distance=Math.max(3.45/fov,4.15/(fov*camera.aspect));
        camera.position.set(0,0,distance);controls.target.set(0,0,0);camera.updateProjectionMatrix();controls.update();controls.saveState();
        renderer.setSize(width,height);labels.setSize(width,height);drawFrame(performance.now());
      };
      function drawFrame(now){
        const t=(now-started)/1000;
        meshes.forEach((m,i)=>{const target=i===activeIndex?1.24:1;m.scale.setScalar(reduced?target:m.scale.x+(target-m.scale.x)*.13)});
        ring.scale.setScalar(reduced?1:1+Math.sin(t*2.8)*.08);
        edges.forEach(e=>{if(!e.active||reduced)return;const phase=(t*.35+e.offset)%1;const from=e.a===activeIndex?e.start:e.end,to=e.a===activeIndex?e.end:e.start;e.packet.position.copy(from).lerp(to,phase)});
        renderer.render(scene,camera);labels.render(scene,camera);
      }
      function loop(now){raf=0;if(!alive||!onScreen||hidden||reduced)return;controls.update();drawFrame(now);raf=requestAnimationFrame(loop)}
      const resume=()=>{if(!raf&&onScreen&&!hidden&&!reduced)raf=requestAnimationFrame(loop)};
      const observer=new IntersectionObserver(([entry])=>{onScreen=entry.isIntersecting;if(onScreen){drawFrame(performance.now());resume()}else{cancelAnimationFrame(raf);raf=0}},{rootMargin:'100px'});observer.observe(host);
      const visibility=()=>{hidden=document.hidden;if(hidden){cancelAnimationFrame(raf);raf=0}else resume()};document.addEventListener('visibilitychange',visibility);
      const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
      const pointerdown=e=>{down={x:e.clientX,y:e.clientY}};
      const pointerup=e=>{
        if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return}down=null;
        const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
        raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(meshes)[0];if(hit){setSelected(nodes[hit.object.userData.index].id);setReplay(v=>v+1)}
      };
      renderer.domElement.addEventListener('pointerdown',pointerdown);
      renderer.domElement.addEventListener('pointerup',pointerup);
      controls.addEventListener('change',()=>{if(reduced)drawFrame(performance.now())});
      const resizeObserver=new ResizeObserver(fit);resizeObserver.observe(host);
      engine.current={select,reset:()=>{controls.reset();drawFrame(performance.now())}};
      fit();select(selectedRef.current);resume();setReady(true);
      cleanup=()=>{
        cancelAnimationFrame(raf);observer.disconnect();resizeObserver.disconnect();document.removeEventListener('visibilitychange',visibility);
        controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerdown);renderer.domElement.removeEventListener('pointerup',pointerup);
        sphere.dispose();packetGeo.dispose();meshes.forEach(m=>m.material.dispose());edges.forEach(e=>{e.line.geometry.dispose();e.line.material.dispose();e.packet.material.dispose()});ring.geometry.dispose();ring.material.dispose();renderer.dispose();host.replaceChildren();engine.current=null;
      };
    })().catch(()=>{if(alive)setFailed(true)});
    return()=>{alive=false;cleanup()};
  },[mode,compact]);

  return <div className={'network-explorer '+(compact?'network-preview':'')}>
    {!compact&&<div className="term-picker" aria-label="选择名词 / Choose a term">{nodes.map(n=><button type="button" key={n.id} aria-pressed={selected===n.id} onClick={()=>{setSelected(n.id);setReplay(v=>v+1)}}><b>{n.id}</b><span>{n.cn}</span></button>)}</div>}
    <div className="three-shell"><div className="three-canvas" ref={mount}/>{!ready&&<div className="network-loading">{failed?'图形未加载，请阅读下方概念说明。 / Read the concept notes below.':'正在加载关系图 / Loading concept map'}</div>}
      <div className="network-controls"><span>拖动旋转 · 点击节点<span className="en">Drag to rotate · Click a node</span></span><button type="button" onClick={()=>engine.current?.reset()}>复位 / Reset</button></div>
    </div>
    {!compact&&<div key={selected+'-'+replay} className="concept-detail" aria-live="polite"><div><b>{active.id} · {active.cn}</b><span className="en">{active.full}</span></div><p>{active.text}<span className="en">{active.en}</span></p></div>}
    {compact&&<a className="preview-link" href="concepts.html">探索概念与调用关系 / Explore the concept maps ↗</a>}
  </div>;
}
