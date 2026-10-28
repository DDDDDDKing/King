/* Shared progress calculations for the read-only dashboard and exports. */
(function(root){
 function report(profile,words,now=Date.now()){
  const state=WN.rebuild(profile.events||[]),reviews=state.events.filter(e=>e.kind==='review'),today=WN.dayKey(now),plan=WN.makePlan(state,words,now),done=WN.dailyDone(state,plan);
  const studied=Object.keys(state.words).length,skipped=state.placement?words.filter((w,i)=>i<state.placement.startIndex&&state.placementAnswers[w.id]!==false&&!state.words[w.id]).length:0;
  const week=[];for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const day=WN.dayKey(d);week.push({day,count:new Set(reviews.filter(e=>WN.dayKey(e.at)===day).map(e=>e.data.wordId)).size});}
  const recent=reviews.slice(-50),correct=recent.filter(e=>e.data.grade>=2).length,accuracy=recent.length?Math.round(correct/recent.length*100):null;
  const due=Object.values(state.words).filter(w=>w.due<=now).length,mistakes=Object.values(state.words).filter(w=>w.lapses&&w.grade<2).length,last=reviews.length?reviews[reviews.length-1].at:null;
  const todayCount=done.newDone+done.reviewDone,total=plan.newIds.length+plan.reviewIds.length;
  let advice=!last?'先完成起点测试，再开始每日任务':mistakes>=3?'先巩固错词，再学今天的新词':due>state.settings.reviewGoal*2?'到期词积压，可增加复习量或少学一点新词':accuracy!==null&&accuracy<60?'最近有些吃力，先保持小目标，多听读和复习':todayCount>=total&&total?'今日目标完成，明天继续':'按今天的任务学完就好';
  return {username:profile.username,studied,skipped,mastered:Object.values(state.words).filter(w=>w.interval>=21&&w.grade>=2).length,due,mistakes,last,accuracy,streak:WN.streak(state,now),todayCount,total,newDone:done.newDone,reviewDone:done.reviewDone,week,advice,updatedAt:profile.updatedAt||null,events:state.events};
 }
 root.WNReport={report};if(typeof module!=='undefined')module.exports=root.WNReport;
})(typeof window!=='undefined'?window:globalThis);
