const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(fs.existsSync(__dirname+'/index.html')?__dirname+'/index.html':__dirname+'/dist/index.html','utf8');const script=html.match(/<script id="app">([\s\S]*?)<\/script>/)[1];
const core=script.slice(script.indexOf('const VERSION'),script.indexOf('const $='));const c=vm.createContext({});vm.runInContext(core+';this.scales=scales;this.scoreScale=scoreScale;this.scorePSS10=scorePSS10;this.scoreManual=scoreManual;',c);const {scales,scoreScale:score}=c;
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
for(const id of ['PHQ9','GAD7','PHQ4','PHQ2','GAD2','SAS','SDS']){for(const bad of [[],Array(scales[id].items.length).fill(null),Array(scales[id].items.length).fill(4),Array(scales[id].items.length).fill(-1),Array(scales[id].items.length).fill(1.5)]){assert.throws(()=>score(id,bad));checks++}}
ok(score('PHQ4',[3,0,0,0]).anxiety,3);ok(score('PHQ4',[0,0,3,0]).depression,3);
let a=Array(9).fill(0);a[8]=1;ok(score('PHQ9',a).safety,true);ok(score('PHQ9',a).total,1);let d=rawAnswers(20,revD);d[18]=1;ok(score('SDS',d).safety,true);
assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|serviceWorker|<script[^>]+src=|<iframe|<form\b|@import|\burl\(/i.test(html));checks++;
assert(html.includes("connect-src 'none'; form-action 'none'"));checks++;
assert(html.includes("const OFFLINE_HTML='<!doctype html>\\n'+document.documentElement.outerHTML"));checks++;
assert(html.includes("'心晴-离线自评.html',OFFLINE_HTML"));checks++;
new vm.Script(script);checks++;

// Added instruments: independent reference cases and branching rules.
ok(Object.keys(scales).length,22);
function fromTotal(n,t,max){return Array.from({length:n},(_,i)=>Math.max(0,Math.min(max,t-i*max)))}
for(const [raw,total,positive] of [[0,0,true],[12,48,true],[13,52,false],[25,100,false]]){const r=score('WHO5',fromTotal(5,raw,5));ok(r.total,total);ok(r.positive,positive)}
for(const [t,b]of [[0,0],[12,0],[13,1],[24,1]]){const r=score('K6',fromTotal(6,t,4));ok(r.total,t);ok(r.band,b)}
for(const [t,b]of [[10,0],[15,0],[16,1],[21,1],[22,2],[29,2],[30,3],[50,3]]){const r=score('K10',fromTotal(10,t-10,4));ok(r.total,t);ok(r.band,b)}
const cr=[4,8,12,16];for(const t of [0,15,16,60]){const pts=fromTotal(20,t,3),a=pts.map((p,i)=>cr.includes(i+1)?3-p:p);ok(score('CESD',a).total,t);ok(score('CESD',a).positive,t>=16)}
const gr=[1,5,7,11,13];for(let mask=0;mask<2**15;mask++){const a=Array.from({length:15},(_,i)=>(mask>>i)&1),expected=a.reduce((sum,v,i)=>sum+(gr.includes(i+1)?1-v:v),0);const r=score('GDS15',a);assert.equal(r.total,expected);assert.equal(r.band,expected<5?0:expected<10?1:2)}checks+=2**15*2;
for(const t of [0,4,5,9,10,14,15,30]){const r=score('PHQ15',fromTotal(15,t,2));ok(r.total,t);ok(r.band,t<5?0:t<10?1:t<15?2:3)}
for(const t of [0,16,17,32]){const a=fromTotal(8,t,4).map(x=>4-x);const r=score('SCI8',a);ok(r.total,t);ok(r.positive,t<=16)}
ok(score('SIDAS',[0,null,null,null,null]).total,0);ok(score('SIDAS',[0,0,10,10,10]).total,0);ok(score('SIDAS',[1,10,0,0,0]).total,1);ok(score('SIDAS',[1,10,0,0,0]).safety,true);ok(score('SIDAS',[10,0,10,10,10]).total,50);assert.throws(()=>score('SIDAS',[1,null,0,0,0]));checks++;
for(let code=0;code<5**6;code++){let v=code;const a=[];for(let i=0;i<6;i++){a.push(v%5);v=Math.floor(v/5)}const expect=a.filter((n,i)=>n>=(i<3?2:3)).length;const r=score('ASRS6',a);assert.equal(r.total,expect);assert.equal(r.positive,expect>=4)}checks+=5**6*2;
ok(score('AUDIT',[4,4,4,4,4,4,4,4,2,2]).total,40);ok(score('AUDIT',[0,null,null,null,null,null,null,null,2,1]).total,6);ok(score('AUDITC',[0,null,null]).total,0);ok(score('AUDITC',[4,4,4]).total,12);for(const[t,b]of[[7,0],[8,1],[15,1],[16,2],[19,2],[20,3]]){const a=fromTotal(8,t,4).concat([0,0]);a[0]||=1;const r=score('AUDIT',a);ok(r.total,t);ok(r.band,b)}
ok(score('FTND',[0,1,1,1,1,3]).total,10);ok(score('FTND',[3,0,0,0,0,0]).total,0);for(const a of [[0,0,0,0],[1,0,0,0],[1,1,0,0],[1,1,1,1]])ok(score('CAGE',a).total,a.reduce((x,y)=>x+y));
for(const[id,s]of Object.entries(scales)){const zero=Array(s.items.length).fill(0);if(id==='SIDAS'||id==='AUDIT'||id==='AUDITC')zero[0]=1;for(let i=0;i<zero.length;i++){const a=zero.slice();a[i]=s.itemOptions?s.itemOptions[i].length:s.options.length;assert.throws(()=>score(id,a));checks++;}}
assert(html.includes('data-journey="anxiety"')&&html.includes('data-journey="depression"')&&html.includes('data-journey="both"'));checks++;
assert(!html.includes('localStorage.clear'));checks++;

// BIS/BAS 20 scored items: four independent dimensions, no total.
const bk=[[1,6,10,13,15,18,20],[2,7,9,17],[4,8,12,16],[3,5,11,14,19]];
for(const vector of [Array(20).fill(0),Array(20).fill(3),Array.from({length:20},(_,i)=>i%4)]){const r=score('BISBAS',vector);ok(r.total,null);for(let k=0;k<4;k++){const ex=bk[k].reduce((sum,i)=>sum+([1,18].includes(i)?4-vector[i-1]:vector[i-1]+1),0);ok(r.subscales[k].total,ex)}}
for(let j=0;j<20;j++){const a=Array(20).fill(0);a[j]=1;const r=score('BISBAS',a),base=score('BISBAS',Array(20).fill(0));for(let k=0;k<4;k++)ok(r.subscales[k].total-base.subscales[k].total,bk[k].includes(j+1)?([1,18].includes(j+1)?-1:1):0)}
const pss=c.scorePSS10;ok(pss([0,0,0,4,4,0,4,4,0,0]).total,0);ok(pss([4,4,4,0,0,4,0,0,4,4]).total,40);ok(pss(Array(10).fill(2)).total,20);assert.throws(()=>pss(Array(10).fill(null)));checks++;
assert(html.includes('id="pssInputs"')&&html.includes('id="calculatePSS"'));checks++;
// Independent 1985 Table 9 EPQ-R short keys; no crossover between dimensions.
const epqYes=[[10,14,22,31,39],[3,7,11,15,19,23,32,36,44,48],[1,5,9,13,17,21,25,30,34,38,42,46],[4,16,45]];
const epqNo=[[2,6,18,26,28,35,43],[27,41],[],[8,12,20,24,29,33,37,40,47]];
ok(scales.EPQR.items.length,48);ok(new Set(epqYes.flat().concat(epqNo.flat())).size,48);
for(let k=0;k<4;k++){let a=Array(48).fill(0);for(const i of epqYes[k])a[i-1]=1;for(const i of epqNo[k])a[i-1]=0;ok(score('EPQR',a).subscales[k].total,12);for(const i of epqYes[k])a[i-1]=0;for(const i of epqNo[k])a[i-1]=1;ok(score('EPQR',a).subscales[k].total,0);}
for(let i=1;i<=48;i++){const a=Array(48).fill(0),base=score('EPQR',a);a[i-1]=1;const r=score('EPQR',a);ok(r.total,null);for(let k=0;k<4;k++)ok(r.subscales[k].total-base.subscales[k].total,epqYes[k].includes(i)?1:epqNo[k].includes(i)?-1:0);}
const manual=c.scoreManual;
for(const[id,n,m]of [['BDI2',21,3],['BAI',21,3],['PDSSSR',7,4],['LSASSR',48,3],['HCL32',32,1]]){ok(manual(id,Array(n).fill(0)).total,0);ok(manual(id,Array(n).fill(m)).total,n*m);for(const a of [Array(n).fill(null),Array(n-1).fill(0),Array(n).fill(m+1),Array(n).fill(-1)]){assert.throws(()=>manual(id,a));checks++;}}
const lsas=manual('LSASSR',Array.from({length:48},(_,i)=>i%2===0?3:1));ok(lsas.fear,72);ok(lsas.avoid,24);ok(lsas.total,96);
assert(html.includes('id="manualTool"')&&html.includes('id="manualInputs"'));checks++;
console.log(JSON.stringify({status:'passed',checks,exhaustivePHQ9Patterns:4**9,allZungRawScores:'20–80',instruments:22,scope:'All 22 scoring schemas and six question-free calculators, bounds, every reverse item, skip logic, GDS15 and ASRS exhaustive cases, crisis flags, clinical thresholds, privacy/CSP, pristine offline export and JS syntax'},null,2));
