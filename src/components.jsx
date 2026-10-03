import React,{useEffect,useRef,useState} from 'react';
import {NAV} from './data.js';

export function Bi({cn,en,className=''}){return <span className={className}>{cn}<span className="en">{en}</span></span>}

export function Layout({page,children}){
  const [open,setOpen]=useState(false);
  return <><nav className="site-nav"><div className="nav-inner"><a className="brand" href="index.html"><span className="brand-mark">N</span><span>NexAI创新工坊<small>NexAI Innovation Workshop</small></span></a><button className="nav-toggle" aria-label="打开导航 Open navigation" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>☰</button><div className={'nav-links '+(open?'open':'')}>{NAV.map(n=><a key={n[0]} href={n[1]} className={page===n[0]?'active':''}>{n[2]}<span>{n[3]}</span></a>)}</div></div></nav><main className="page-shell">{children}</main><footer className="footer"><div className="wrap footer-inner"><p>NexAI创新工坊线下沙龙<span className="en">NexAI Innovation Workshop · Offline Salon</span></p><p><a href="downloads.html">软件下载 Downloads</a> · <a href="concepts.html">概念图谱 Concepts</a></p></div></footer></>
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

export {ThreeNetwork} from './InteractiveNetwork.jsx';
