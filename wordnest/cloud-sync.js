/* Public application API. No repository credential is ever sent to this service. */
(()=>{
 const endpoint=()=>String(window.WORDNEST_CONFIG?.cloudEndpoint||'').replace(/\/$/,'');
 async function request(path,body){
  const r=await fetch(endpoint()+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(20000)});
  let data;try{data=await r.json();}catch{throw new Error('同步服务返回异常，请稍后重试');}
  if(!r.ok)throw new Error(data.error||`同步暂不可用（${r.status}）`);return data;
 }
 async function sync(c,token,name,local,latest=()=>local,onMerge=()=>{}){
  // Send bounded batches; merge once more after the last response to retain edits made in flight.
  let result=await request('/api/sync',{username:name,events:[]});
  let seed=result.events;
  // First cloud visit imports the existing public GitHub profile before choosing a plan.
  if(!seed.length&&GH.validConfig(c)){const old=await GH.get(c,'',name);seed=old.events;}
  const pending=WN.merge(seed,latest());
  for(let i=0;i<Math.max(1,pending.length);i+=200){result=await request('/api/sync',{username:name,events:pending.slice(i,i+200)});onMerge(WN.merge(result.events,latest()));}
  return {events:WN.merge([],result.events),wrote:true};
 }
 window.Cloud={enabled:()=>!!endpoint(),request,sync};
})();
