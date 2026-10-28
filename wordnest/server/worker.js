import './shared-core.js';
const W=globalThis.WN;
const enc=new TextEncoder(),b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const username=s=>typeof s==='string'&&s.trim().length>0&&s.normalize('NFKC').trim().length<=30&&!/[\u0000-\u001f]/.test(s);
function valid(e){if(!W.validEvent(e)||!e.id||e.at>Date.now()+300000||JSON.stringify(e).length>6000)return false;const d=e.data;
 if(e.kind==='plan')return /^\d{4}-\d{2}-\d{2}$/.test(d.day)&&[...d.newIds,...d.reviewIds].every(id=>Number.isInteger(id)&&id>=1&&id<=6000);
 if(e.kind==='favorite')return Number.isInteger(d.wordId)&&d.wordId>=1&&d.wordId<=6000&&typeof d.value==='boolean';return true;}
async function profiles(db,name){const users=name?[await db.prepare('SELECT * FROM learners WHERE name=?').bind(name).first()].filter(Boolean):(await db.prepare('SELECT * FROM learners ORDER BY updated_at DESC LIMIT 200').all()).results;const list=[];for(const user of users){const rows=await db.prepare('SELECT event FROM events WHERE name=? ORDER BY at,id').bind(user.name).all();list.push({version:1,username:user.display_name,updatedAt:user.updated_at,events:W.merge([],rows.results.map(r=>JSON.parse(r.event)))});}return list;}
async function vapid(db){let row=await db.prepare("SELECT value FROM config WHERE key='vapid'").first();if(!row){const key=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const data={private:await crypto.subtle.exportKey('jwk',key.privateKey),public:b64(await crypto.subtle.exportKey('raw',key.publicKey))};await db.prepare("INSERT OR IGNORE INTO config(key,value) VALUES('vapid',?)").bind(JSON.stringify(data)).run();row=await db.prepare("SELECT value FROM config WHERE key='vapid'").first();}return JSON.parse(row.value);}
function trustedEndpoint(s){try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com'].some(h=>u.hostname===h||u.hostname.endsWith('.'+h));}catch{return false;}}
export default {
 async fetch(request,env){const origin=request.headers.get('Origin'),allowed=env.ALLOWED_ORIGIN||'https://ddddddking.github.io';const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};const reply=(data,status=200)=>Response.json(data,{status,headers});
  if(origin&&origin!==allowed)return reply({error:'来源不受支持'},403);if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  try {const url=new URL(request.url),path=url.pathname;
   if(path==='/api/health')return reply({ok:!!env.DB,version:2,storage:'D1'});
   if(!env.DB)return reply({error:'请先绑定 D1 数据库并应用迁移'},503);
   if(request.method==='GET'&&path==='/api/profiles')return reply({profiles:await profiles(env.DB)});
   if(request.method==='GET'&&path==='/api/push-key')return reply({publicKey:(await vapid(env.DB)).public});
   if(request.method!=='POST')return reply({error:'接口不存在'},404);
   const text=await request.text();if(enc.encode(text).length>350000)return reply({error:'单次记录过大，请分批保存'},413);let data;try{data=JSON.parse(text);}catch{return reply({error:'请求格式错误'},400);}
   if(!username(data.username))return reply({error:'请输入 1–30 字的昵称'},400);const name=W.normalizeName(data.username);
   if(path==='/api/sync'){
    if(!Array.isArray(data.events)||data.events.length>200||data.events.some(e=>!valid(e)))return reply({error:'学习记录格式不正确'},400);
    const count=await env.DB.prepare('SELECT COUNT(*) AS n FROM events WHERE name=?').bind(name).first();if(count.n>100000)return reply({error:'档案已达容量上限，请先导出备份'},413);
    const exists=await env.DB.prepare('SELECT name FROM learners WHERE name=?').bind(name).first();if(!exists){const n=await env.DB.prepare('SELECT COUNT(*) AS n FROM learners').first();if(n.n>=200)return reply({error:'家庭档案数量已达上限'},429);}
    // Never replace an entire profile. Concurrent devices append immutable IDs.
    for(let i=0;i<data.events.length;i+=40)await env.DB.batch(data.events.slice(i,i+40).map(e=>env.DB.prepare('INSERT OR IGNORE INTO events(name,id,at,event) VALUES(?,?,?,?)').bind(name,e.id,e.at,JSON.stringify(e))));
    await env.DB.prepare('INSERT INTO learners(name,display_name,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET updated_at=excluded.updated_at').bind(name,data.username.normalize('NFKC').trim(),new Date().toISOString()).run();
    return reply((await profiles(env.DB,name))[0]);
   }
   if(path==='/api/subscribe'){
    const s=data.subscription;if(!s||typeof s.endpoint!=='string'||s.endpoint.length>4096||!trustedEndpoint(s.endpoint))return reply({error:'此浏览器的推送服务暂不受支持'},400);
    if(data.remove){await env.DB.prepare('DELETE FROM subscriptions WHERE endpoint=? AND name=?').bind(s.endpoint,name).run();return reply({ok:true});}
    if(!Number.isInteger(data.hour)||data.hour<0||data.hour>23||!Number.isInteger(data.minute)||data.minute<0||data.minute>59)return reply({error:'提醒时间不正确'},400);
    try{new Intl.DateTimeFormat('en',{timeZone:data.timezone}).format();}catch{return reply({error:'时区不正确'},400);}
    await env.DB.prepare('INSERT INTO subscriptions(endpoint,name,timezone,hour,minute) VALUES(?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET name=excluded.name,timezone=excluded.timezone,hour=excluded.hour,minute=excluded.minute,last_day=NULL').bind(s.endpoint,name,data.timezone,data.hour,data.minute).run();return reply({ok:true});
   }return reply({error:'接口不存在'},404);
  }catch(error){console.error('WordNest API failure',error?.message);return reply({error:'同步服务暂时繁忙，本机记录不会丢失，请稍后重试'},503);}
 },
 async scheduled(event,env,ctx){ctx.waitUntil(sendReminders(env,event.scheduledTime));}
};
export async function sendReminders(env,now=Date.now()){
 const key=await vapid(env.DB),privateKey=await crypto.subtle.importKey('jwk',key.private,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const subs=(await env.DB.prepare('SELECT * FROM subscriptions LIMIT 500').all()).results;
 for(const s of subs){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:s.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));const day=`${parts.year}-${parts.month}-${parts.day}`,minute=Number(parts.hour)*60+Number(parts.minute),target=s.hour*60+s.minute;if(s.last_day===day||minute<target||minute>=target+10)continue;
  const rows=(await env.DB.prepare('SELECT event FROM events WHERE name=?').bind(s.name).all()).results.map(r=>JSON.parse(r.event)),daily=rows.filter(e=>e.kind==='review'&&e.data.mode==='daily'&&new Intl.DateTimeFormat('en-CA',{timeZone:s.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(e.at)===day),plan=rows.find(e=>e.kind==='plan'&&e.data.day===day);
  if(plan){const done=new Set(daily.map(e=>e.data.wordId)),ids=[...plan.data.newIds,...plan.data.reviewIds];if(ids.length&&ids.every(id=>done.has(id)))continue;}
  const aud=new URL(s.endpoint).origin,head=b64(enc.encode(JSON.stringify({typ:'JWT',alg:'ES256'}))),payload=b64(enc.encode(JSON.stringify({aud,exp:Math.floor(now/1000)+3600,sub:env.VAPID_SUBJECT||'https://ddddddking.github.io/King/wordnest/'}))),unsigned=head+'.'+payload,sig=b64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},privateKey,enc.encode(unsigned)));
  try{const r=await fetch(s.endpoint,{method:'POST',headers:{TTL:'300',Urgency:'normal',Authorization:`vapid t=${unsigned}.${sig}, k=${key.public}`},redirect:'error',signal:AbortSignal.timeout(10000)});if(r.ok)await env.DB.prepare('UPDATE subscriptions SET last_day=? WHERE endpoint=?').bind(day,s.endpoint).run();else if([404,410].includes(r.status))await env.DB.prepare('DELETE FROM subscriptions WHERE endpoint=?').bind(s.endpoint).run();}catch(e){console.error('push delivery failed');}
 }
}
