(function(root){
 const encode=s=>{const bytes=new TextEncoder().encode(s);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);};
 const decode=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
 async function request(url,token,options={}){const r=await fetch(url,{...options,headers:{Accept:'application/vnd.github+json',...(token?{Authorization:`Bearer ${token}`} : {}),...options.headers},cache:'no-store'});if(!r.ok){const text=await r.text();const error=new Error(r.status===401?'授权令牌无效或已过期':r.status===403?'没有写入权限，或请求过于频繁':r.status===404?'仓库、分支或文件不存在':`GitHub 请求失败（${r.status}）`);error.status=r.status;error.detail=text;throw error;}return r.json();}
 function base(c){return `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}`;}
 function fileUrl(c,name){return `${base(c)}/contents/${[c.folder||'progress',`user-${WN.profileId(name)}.json`].join('/').split('/').map(encodeURIComponent).join('/')}`;}
 function validConfig(c){return c&&/^[a-zA-Z0-9-]{1,39}$/.test(c.owner)&&/^[a-zA-Z0-9_.-]{1,100}$/.test(c.repo)&&typeof c.branch==='string'&&c.branch.length>0&&c.branch.length<=200&&/^[a-zA-Z0-9_/-]{1,100}$/.test(c.folder||'progress')&&!(c.folder||'progress').includes('..');}
 async function get(c,token,name){
  let file;try{file=await request(fileUrl(c,name)+`?ref=${encodeURIComponent(c.branch)}`,token);}catch(e){if(e.status!==404)throw e;await request(`${base(c)}/branches/${encodeURIComponent(c.branch)}`,token);return {sha:null,events:[]};}
  let data;if(file.content){try{data=JSON.parse(decode(file.content));}catch(e){throw new Error('仓库进度文件无法读取，请先检查或恢复备份');}}
  else {const r=await fetch(fileUrl(c,name)+`?ref=${encodeURIComponent(c.branch)}`,{headers:{Accept:'application/vnd.github.raw+json',...(token?{Authorization:`Bearer ${token}`}:{})},cache:'no-store'});if(!r.ok)throw new Error('无法读取完整进度文件');data=await r.json();}
  if(data.version!==1||WN.normalizeName(data.username)!==WN.normalizeName(name)||!Array.isArray(data.events))throw new Error('进度文件格式或用户名不匹配，请检查仓库');
  if(data.events.some(e=>!WN.validEvent(e)))throw new Error('进度文件包含无法识别的记录，请恢复有效备份');
  return {sha:file.sha,events:data.events};
 }
 async function sync(c,token,name,local,latest=()=>local,onMerge=()=>{}){
  if(!validConfig(c))throw new Error('请先填写正确的仓库设置');if(!token)throw new Error('请让家长为此设备设置仓库授权');
  for(let attempt=0;attempt<4;attempt++){
   const remote=await get(c,token,name);const events=WN.merge(remote.events,latest());onMerge(events);
   if(JSON.stringify(WN.merge([],remote.events))===JSON.stringify(events))return {events,wrote:false};
   const content=encode(JSON.stringify({version:1,username:WN.normalizeName(name),updatedAt:new Date().toISOString(),events}));
   const body={message:'WordNest: save learning progress [skip ci]',content,branch:c.branch,...(remote.sha?{sha:remote.sha}:{})};
   try{await request(fileUrl(c,name),token,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {events,wrote:true};}
   catch(e){if(e.status!==409&&e.status!==422)throw e;if(attempt===3)throw new Error('另一台设备正在保存，请稍后重试同步');await new Promise(r=>setTimeout(r,250*(attempt+1)));}
  }
 }
 root.GH={encode,decode,validConfig,get,sync};if(typeof module!=='undefined')module.exports=root.GH;
})(typeof window!=='undefined'?window:globalThis);
