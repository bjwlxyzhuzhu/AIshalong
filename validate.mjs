import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const base=decodeURIComponent(root);
const html=await fs.readFile(path.join(base,'dist/index.html'),'utf8');
const governmentHTML=await fs.readFile(path.join(base,'dist/government/index.html'),'utf8');
for(const [,attrs,js] of (html+'\n'+governmentHTML).matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
  if(attrs.includes('importmap')){JSON.parse(js);continue;}
  const result=spawnSync(process.execPath,['--check',...(attrs.includes('module')?['--input-type=module']:[])],{input:js,encoding:'utf8'});
  if(result.status!==0)throw Error(result.stderr);
}
async function walk(dir){const result=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await walk(p));else result.push(p);}return result;}
const files=await walk(path.join(base,'dist'));
let refs=0;
for(const file of files.filter(x=>x.endsWith('.html'))){
  const text=(await fs.readFile(file,'utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  for(const [,value] of text.matchAll(/(?:src|href)="([^"<>]+)"/g)){
    if(/^(?:[a-z]+:|#|\/\/)/i.test(value))continue;
    const p=path.resolve(path.dirname(file),decodeURIComponent(value.split(/[?#]/)[0]));
    if(!p.startsWith(path.join(base,'dist')+path.sep))throw Error('Path outside dist: '+value);
    await fs.access(p);refs++;
  }
}
const original=path.join(base,'../jiangsu-university-ai-salon-site/dist');
const originalFiles=await walk(original);
for(const f of originalFiles){const copy=path.join(base,'dist/enterprise',path.relative(original,f));const hash=b=>createHash('sha256').update(b).digest('hex');if(hash(await fs.readFile(f))!==hash(await fs.readFile(copy)))throw Error('Enterprise differs: '+f);}
const governmentLinks=[...html.matchAll(/href="\.\/government\/index\.html"/g)].length;
if(governmentLinks!==2||/Coming soon|Government edition is not available yet/.test(html))throw Error('Government entry not fully enabled');
console.log(JSON.stringify({files:files.length,localReferences:refs,enterpriseFilesUnchanged:originalFiles.length,inlineScripts:'syntax passed',governmentLinks},null,2));
