/* Family learning storage only. This public project seed grants no GitHub access. */
(()=>{'use strict';
 let token='',until=0,keyPromise=null;const indexed=new Set();
 const seed=()=>window.WORDNEST_CONFIG?.storageSeed;
 async function json(url,options={}){const r=await fetch(url,{...options,cache:'no-store',signal:AbortSignal.timeout(25000)});const d=await r.json();if(!r.ok||d.success===false)throw new Error(d.message||`家庭存储暂不可用（${r.status}）`);return d;}
 async function key(){if(token&&Date.now()<until)return token;if(!keyPromise)keyPromise=json('https://prefs.us/getkey/?name=wordnest-family&seed='+encodeURIComponent(seed()),{headers:{'X-Prefs-Secure':'https:'}}).then(d=>{if(!d.token)throw new Error('家庭存储授权暂不可用');token=d.token;until=Date.now()+30000;return token;}).finally(()=>keyPromise=null);return keyPromise;}
 async function query(domain,field,body){const t=await key(),params=new URLSearchParams({domain,project:'wordnest',ttl:'3650'});const url='https://prefs.us/'+(body===undefined?'read':'write')+'/?'+encodeURIComponent(field)+(body===undefined?'':'=')+'&'+params;
  const d=await json(url,{method:body===undefined?'GET':'POST',headers:{'X-Authorization':'Token '+t,'X-Prefs-Secure':'https:',...(body===undefined?{}:{'Content-Type':'text/plain'})},...(body===undefined?{}:{body:JSON.stringify(body)})});return d;
 }
 function unpack(d){let values=d.values?d.values.flatMap(row=>Object.entries(row).filter(([k])=>k!=='uid').map(([,v])=>v)):d.count&&d.value!==undefined?[d.value]:[];return values.map(v=>{try{return typeof v==='string'?JSON.parse(v):v;}catch{return null;}}).filter(Boolean);}
 async function read(name){const parts=unpack(await query('user-'+WN.profileId(name),'*'));return WN.merge([],parts.flatMap(p=>Array.isArray(p.events)?p.events:[]));}
 async function sync(c,t,name,local,latest=()=>local,onMerge=()=>{}){
  let remote=await read(name),base=remote;
  if(!remote.length&&GH.validConfig(c)){base=WN.merge(base,(await GH.get(c,'',name)).events);}
  const all=WN.merge(base,latest()),known=new Set(remote.map(e=>e.id)),missing=all.filter(e=>!known.has(e.id));
  // Immutable batches: simultaneous devices write separate keys, never replace a profile.
  for(let i=0;i<missing.length;i+=100){const batch=missing.slice(i,i+100),hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(batch.map(e=>e.id).join('|'))),id=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');await query('user-'+WN.profileId(name),'b_'+id,{events:batch});}
  const id=WN.profileId(name);if(!indexed.has(id)){await query('profiles','u_'+id,{username:WN.normalizeName(name),version:1});indexed.add(id);}
  const saved=WN.merge(remote,missing);onMerge(WN.merge(saved,latest()));return {events:saved,wrote:missing.length>0};
 }
 async function request(path){if(path!=='/api/profiles')throw new Error('当前免密方案支持学习同步。后台网页推送尚未开通，请使用手机日历提醒。');const people=unpack(await query('profiles','*')).filter(p=>typeof p.username==='string');const profiles=[];for(const p of people)profiles.push({...p,events:await read(p.username)});return {profiles};}
 window.PrefsSync={sync,request,unpack,read,enabled:()=>!!seed()};
})();
