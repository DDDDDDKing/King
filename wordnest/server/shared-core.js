/* WordNest: deterministic, mergeable learning history. */
(function(root){
 const DAY=86400000;
 const defaults={newGoal:5,reviewGoal:5,accent:'en-US',rate:.85,autoSpeak:true};
 function dayKey(time=Date.now()){const d=new Date(time);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
 function normalizeName(s){return String(s).normalize('NFKC').trim().toLowerCase();}
 function profileId(s){return Array.from(new TextEncoder().encode(normalizeName(s)),b=>b.toString(16).padStart(2,'0')).join('');}
 function merge(a,b){const m=new Map();for(const e of [...a,...b])if(validEvent(e)&&!m.has(e.id))m.set(e.id,e);return [...m.values()].sort((x,y)=>x.at-y.at||x.id.localeCompare(y.id));}
 function validEvent(e){
  if(!e||typeof e.id!=='string'||e.id.length>120||!Number.isFinite(e.at)||e.at<0||!['review','favorite','settings','plan','placementAnswer','placement','masteryRange','masteryUndo'].includes(e.kind)||!e.data||typeof e.data!=='object')return false;
  if(e.kind==='masteryRange')return typeof e.data.mastered==='boolean'&&Array.isArray(e.data.ranges)&&e.data.ranges.length>0&&e.data.ranges.length<=50&&e.data.ranges.every(r=>Array.isArray(r)&&r.length===2&&r.every(n=>Number.isInteger(n)&&n>=1&&n<=6000)&&r[0]<=r[1]);
  if(e.kind==='masteryUndo')return typeof e.data.target==='string'&&e.data.target.length>0&&e.data.target.length<=120;
  if(e.kind==='placementAnswer')return Number.isInteger(e.data.wordId)&&e.data.wordId>=1&&e.data.wordId<=6000&&typeof e.data.correct==='boolean';
  if(e.kind==='placement')return Number.isInteger(e.data.startIndex)&&e.data.startIndex>=0&&e.data.startIndex<=6000;
  if(e.kind==='review')return Number.isInteger(e.data.wordId)&&e.data.wordId>=1&&e.data.wordId<=6000&&[0,1,2,3].includes(e.data.grade);
  if(e.kind==='plan')return /^\d{4}-\d{2}-\d{2}$/.test(e.data.day)&&Array.isArray(e.data.newIds)&&Array.isArray(e.data.reviewIds)&&e.data.newIds.length<=30&&e.data.reviewIds.length<=30&&[...e.data.newIds,...e.data.reviewIds].every(id=>Number.isInteger(id)&&id>=1&&id<=6000);
  if(e.kind==='favorite')return Number.isInteger(e.data.wordId)&&e.data.wordId>=1&&e.data.wordId<=6000&&typeof e.data.value==='boolean';
  return true;
 }
 function advance(prev,grade,at){
  const p=prev||{reps:0,lapses:0,interval:0,ease:2.3,first:at,last:0};
  let interval,reps=p.reps,lapses=p.lapses,ease=p.ease;
  if(grade===0){interval=0;reps=0;lapses++;ease=Math.max(1.3,ease-.2);}
  else if(grade===1){interval=Math.max(1,Math.round((p.interval||1)*1.2));ease=Math.max(1.3,ease-.15);reps++;}
  else {interval=reps===0?1:reps===1?3:Math.min(365,Math.max(p.interval+1,Math.round(p.interval*ease*(grade===3?1.3:1))));reps++;if(grade===3)ease=Math.min(3,ease+.1);}
  return {...p,reps,lapses,ease,interval,last:at,due:at+(grade===0?10*60000:interval*DAY),count:(p.count||0)+1,grade};
 }
 function rebuild(events){
  const state={words:{},favorites:{},settings:{...defaults},plans:{},placement:null,placementAnswers:{},manualMastery:{},masteryRevision:'',events:merge([],events)};
  const undone=new Set(state.events.filter(e=>e.kind==='masteryUndo').map(e=>e.data.target));
  for(const e of state.events){const d=e.data;
   if(e.kind==='masteryRange'||e.kind==='masteryUndo')state.masteryRevision=e.id;
   if(e.kind==='masteryRange'&&!undone.has(e.id))for(const [from,to] of d.ranges)for(let id=from;id<=to;id++)state.manualMastery[id]=d.mastered;
  if(e.kind==='review')state.words[d.wordId]=advance(state.words[d.wordId],d.grade,e.at);
   if(e.kind==='placementAnswer'&&state.placementAnswers[d.wordId]===undefined)state.placementAnswers[d.wordId]=d.correct;
   if(e.kind==='placement'&&!state.placement){state.placement={...d};state.plans={};}
   if(e.kind==='favorite'&&Number.isInteger(d.wordId))state.favorites[d.wordId]=!!d.value;
   if(e.kind==='settings'){for(const k of ['newGoal','reviewGoal'])if(Number.isInteger(d[k])&&d[k]>=1&&d[k]<=30)state.settings[k]=d[k];if(['en-US','en-GB'].includes(d.accent))state.settings.accent=d.accent;if(typeof d.autoSpeak==='boolean')state.settings.autoSpeak=d.autoSpeak;if(Number.isFinite(d.rate)&&d.rate>=.5&&d.rate<=1.3)state.settings.rate=d.rate;}
   if(e.kind==='plan'&&/^\d{4}-\d{2}-\d{2}$/.test(d.day)&&(!state.plans[d.day]||(d.revision&&d.revision===state.masteryRevision)))state.plans[d.day]={...d,newIds:(d.newIds||[]).filter(id=>Number.isInteger(id)&&id>=1&&id<=6000),reviewIds:(d.reviewIds||[]).filter(id=>Number.isInteger(id)&&id>=1&&id<=6000)};
  }
  return state;
 }
 function hash(s){let h=2166136261;for(const ch of s)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
 function makePlan(state,words,at=Date.now()){
  const day=dayKey(at);if(state.plans[day]&&(state.plans[day].revision||'')===state.masteryRevision)return state.plans[day];
  const start=state.placement?.startIndex||0;
  const completed=words.filter(w=>state.manualMastery[w.id]!==true&&state.words[w.id]&&dayKey(state.words[w.id].first)===day&&state.events.some(e=>e.kind==='review'&&e.data.mode==='daily'&&e.data.wordId===w.id&&dayKey(e.at)===day)).map(w=>w.id);
  const candidates=words.filter((w,i)=>state.manualMastery[w.id]!==true&&!state.words[w.id]&&(i>=start||state.placementAnswers[w.id]===false||state.manualMastery[w.id]===false)).map(w=>w.id);
  const newIds=[...completed,...candidates].slice(0,state.settings.newGoal);
  const learned=words.filter(w=>state.manualMastery[w.id]!==true&&state.words[w.id]&&dayKey(state.words[w.id].first)!==day);
  learned.sort((a,b)=>{const x=state.words[a.id],y=state.words[b.id];const xd=x.due<=at,yd=y.due<=at;if(xd!==yd)return xd?-1:1;if(xd&&x.due!==y.due)return x.due-y.due;return x.count-y.count||x.last-y.last||hash(day+a.id)-hash(day+b.id);});
  return {day,revision:state.masteryRevision,newIds,reviewIds:learned.slice(0,state.settings.reviewGoal).map(w=>w.id)};
 }
 function dailyDone(state,plan){const done=new Set(state.events.filter(e=>e.kind==='review'&&e.data.mode==='daily'&&dayKey(e.at)===plan.day).map(e=>e.data.wordId));return {done,newDone:plan.newIds.filter(id=>done.has(id)).length,reviewDone:plan.reviewIds.filter(id=>done.has(id)).length};}
 function streak(state,now=Date.now()){const dates=new Set(state.events.filter(e=>e.kind==='review').map(e=>dayKey(e.at)));let d=new Date(now);let n=0;if(!dates.has(dayKey(d)))d.setDate(d.getDate()-1);while(dates.has(dayKey(d))){n++;d.setDate(d.getDate()-1);}return n;}
 function placementProgress(state,words){
  for(let start=0;start<words.length;start+=5){const group=words.slice(start,start+5);const next=group.findIndex(w=>state.placementAnswers[w.id]===undefined);if(next>=0)return {index:start+next,start,finished:false};const correct=group.filter(w=>state.placementAnswers[w.id]).length;if(correct<=3)return {index:start+group.length,start,correct,finished:true};}
  return {index:words.length,start:words.length,correct:5,finished:true};
 }
 function parseRanges(text){const chunks=String(text).trim().split(/[\s,，、;；]+/).filter(Boolean);if(!chunks.length||chunks.length>50)throw new Error('请输入 1–50 段词条编号，例如 1-300, 500-600');const ranges=chunks.map(x=>{const m=x.match(/^(\d+)(?:[-~～至到–—](\d+))?$/);if(!m)throw new Error('编号格式不正确：'+x);const a=Number(m[1]),b=Number(m[2]||m[1]);if(a<1||b>6000||a>b)throw new Error('编号需在 1–6000 之间，起始编号不能大于结束编号');return [a,b];}).sort((a,b)=>a[0]-b[0]);const merged=[];for(const r of ranges){const p=merged.at(-1);if(p&&r[0]<=p[1]+1)p[1]=Math.max(p[1],r[1]);else merged.push([...r]);}return merged;}
 const api={parseRanges,DAY,defaults,dayKey,normalizeName,profileId,merge,validEvent,advance,rebuild,makePlan,dailyDone,streak,placementProgress};root.WN=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
