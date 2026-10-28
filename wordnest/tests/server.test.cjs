const {test}=require('node:test'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),fs=require('node:fs');
function adapter(){const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync(require.resolve('../server/schema.sql'),'utf8'));return {prepare(sql){return {bind(...args){return make(sql,args);},...make(sql,[])};},batch:async q=>{for(const x of q)await x.run();}};function make(sql,args){return {first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>db.prepare(sql).run(...args)};}}
const load=()=>import('../server/worker.js'),req=(path,body)=>new Request('https://example.workers.dev'+path,body?{method:'POST',headers:{Origin:'https://ddddddking.github.io','Content-Type':'application/json'},body:JSON.stringify(body)}:{});
test('cloud API merges two devices, deduplicates retries and provides read-only profiles',async()=>{const {default:worker}=await load(),env={DB:adapter()},e=(id,wordId)=>({id,at:Date.now(),kind:'review',data:{wordId,grade:2,mode:'daily'}});const a=e('a',1),b=e('b',2);
 assert.equal((await worker.fetch(req('/api/sync',{username:'Child',events:[a]}),env)).status,200);
 await worker.fetch(req('/api/sync',{username:'child',events:[b,a]}),env);await worker.fetch(req('/api/sync',{username:'child',events:[a]}),env);
 const profiles=(await (await worker.fetch(req('/api/profiles'),env)).json()).profiles;assert.equal(profiles.length,1);assert.equal(profiles[0].events.length,2);
 assert.equal((await worker.fetch(req('/api/sync',{username:'child',events:[{...a,data:{wordId:-1,grade:2}}]}),env)).status,400);
 assert.equal((await worker.fetch(req('/api/delete',{username:'child'}),env)).status,404);
 assert.equal((await worker.fetch(new Request('https://example/api/sync',{method:'POST',headers:{Origin:'https://evil.example'}}),env)).status,403);
});
test('push private key is stable and never appears in public profiles',async()=>{const {default:worker}=await load(),env={DB:adapter()};const one=await (await worker.fetch(req('/api/push-key'),env)).json(),two=await (await worker.fetch(req('/api/push-key'),env)).json();assert.equal(one.publicKey,two.publicKey);assert.equal(one.publicKey.length,87);const dump=await (await worker.fetch(req('/api/profiles'),env)).text();assert.equal(dump.includes('private'),false);});
test('reminders use learner timezone, skip completed days and send once per day',async()=>{const {sendReminders}=await load(),DB=adapter(),now=Date.parse('2026-10-28T17:30:00Z'),endpoint='https://fcm.googleapis.com/fcm/send/test-only',original=global.fetch;let sent=0;
 await DB.prepare('INSERT INTO subscriptions(endpoint,name,timezone,hour,minute) VALUES(?,?,?,?,?)').bind(endpoint,'child','Asia/Shanghai',1,30).run();
 global.fetch=async(url,options)=>{assert.equal(url,endpoint);assert.match(options.headers.Authorization,/^vapid t=/);sent++;return new Response(null,{status:201});};
 try {await sendReminders({DB},now);await sendReminders({DB},now+60000);assert.equal(sent,1);
  await DB.prepare('UPDATE subscriptions SET last_day=NULL').run();const events=[{id:'plan',at:now-1000,kind:'plan',data:{day:'2026-10-29',newIds:[1],reviewIds:[]}},{id:'review',at:now-500,kind:'review',data:{wordId:1,grade:2,mode:'daily'}}];
  for(const e of events)await DB.prepare('INSERT INTO events(name,id,at,event) VALUES(?,?,?,?)').bind('child',e.id,e.at,JSON.stringify(e)).run();await sendReminders({DB},now);assert.equal(sent,1);
 }finally{global.fetch=original;}
});
