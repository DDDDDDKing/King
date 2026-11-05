const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(fs.existsSync(__dirname+'/index.html')?__dirname+'/index.html':__dirname+'/dist/index.html','utf8');const script=html.match(/<script id="app">([\s\S]*?)<\/script>/)[1];
const core=script.slice(script.indexOf('const VERSION'),script.indexOf('const $='));const c=vm.createContext({});vm.runInContext(core+';this.scales=scales;this.scoreScale=scoreScale;',c);const {scales,scoreScale:score}=c;
// Independent expected boundaries, not read from implementation configuration.
const expected={PHQ9:[[4,0],[5,1],[9,1],[10,2],[14,2],[15,3],[19,3],[20,4],[27,4]],GAD7:[[4,0],[5,1],[9,1],[10,2],[14,2],[15,3],[21,3]],PHQ4:[[2,0],[3,1],[5,1],[6,2],[8,2],[9,3],[12,3]],PHQ2:[[2,0],[3,1],[6,1]],GAD2:[[2,0],[3,1],[6,1]]};
function sumAnswers(n,total){return Array.from({length:n},(_,i)=>Math.max(0,Math.min(3,total-3*i)))}
let checks=0;function ok(a,b){assert.deepEqual(a,b);checks++}
for(const[id,cases]of Object.entries(expected)){for(const[t,b]of cases){let r=score(id,sumAnswers(scales[id].items.length,t));ok(r.total,t);ok(r.band,b)}}
const revA=[5,9,13,17,19],revD=[2,5,6,11,12,14,16,17,18,20];
function rawAnswers(raw,rev){const points=Array(20).fill(1);let rest=raw-20;for(let i=0;i<20;i++){let v=Math.min(3,rest);points[i]+=v;rest-=v}return points.map((p,i)=>rev.includes(i+1)?4-p:p-1)}
for(let raw=20;raw<=80;raw++){for(const id of ['SAS','SDS']){const r=score(id,rawAnswers(raw,id==='SAS'?revA:revD));const standard=id==='SAS'?Math.floor(raw*1.25):Math.floor(raw*1.25+0.5);ok(r.raw,raw);ok(r.total,standard);const band=id==='SAS'?(standard<50?0:standard<60?1:standard<70?2:3):(standard<53?0:standard<63?1:standard<73?2:3);ok(r.band,band)}}
for(const[id,rev]of [['SAS',revA],['SDS',revD]]){let baseline=rawAnswers(20,rev);ok(score(id,baseline).total,25);ok(score(id,rawAnswers(80,rev)).total,100);for(let i=0;i<20;i++){let a=baseline.slice();a[i]+=rev.includes(i+1)?-1:1;ok(score(id,a).raw,21)}}
ok(score('SDS',rawAnswers(42,revD)).total,53);ok(score('SAS',rawAnswers(39,revA)).total,48);ok(score('SAS',rawAnswers(40,revA)).total,50);
// Exhaustive totals for the 9-item direct-sum questionnaire.
for(let mask=0;mask<4**9;mask++){let m=mask,a=[],sum=0;for(let i=0;i<9;i++){const x=m%4;a.push(x);sum+=x;m=Math.floor(m/4)}const r=score('PHQ9',a);assert.equal(r.total,sum);assert.equal(r.safety,a[8]>0)}checks+=4**9*2;
for(const id of Object.keys(scales)){for(const bad of [[],Array(scales[id].items.length).fill(null),Array(scales[id].items.length).fill(4),Array(scales[id].items.length).fill(-1),Array(scales[id].items.length).fill(1.5)]){assert.throws(()=>score(id,bad));checks++}}
ok(score('PHQ4',[3,0,0,0]).anxiety,3);ok(score('PHQ4',[0,0,3,0]).depression,3);
let a=Array(9).fill(0);a[8]=1;ok(score('PHQ9',a).safety,true);ok(score('PHQ9',a).total,1);let d=rawAnswers(20,revD);d[18]=1;ok(score('SDS',d).safety,true);
assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|serviceWorker|<script[^>]+src=|<iframe|<form\b|@import|\burl\(/i.test(html));checks++;
assert(html.includes("connect-src 'none'; form-action 'none'"));checks++;
assert(html.includes("const OFFLINE_HTML='<!doctype html>\\n'+document.documentElement.outerHTML"));checks++;
assert(html.includes("'心晴-离线自评.html',OFFLINE_HTML"));checks++;
new vm.Script(script);checks++;
console.log(JSON.stringify({status:'passed',checks,exhaustivePHQ9Patterns:4**9,allZungRawScores:'20–80',scope:'Scoring boundaries, every reverse item, missing/invalid data, safety flags, PHQ-4 subscales, network API/CSP audit, pristine offline download, JS syntax'},null,2));
