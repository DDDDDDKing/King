(()=>{
 const save=(time,status)=>{localStorage.setItem('wn-reminder',JSON.stringify({time,status}));const el=document.querySelector('#reminderStatus');if(el)el.textContent=status;};
 const from64=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const date=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
 async function registration(){if(!('serviceWorker'in navigator))throw new Error('此浏览器不支持网页推送，可使用日历提醒');await navigator.serviceWorker.register('./sw.js');return Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('通知服务尚未就绪，请刷新后重试')),15000))]);}
 window.WNReminders={async handle(action,name,time){
  const [hour,minute]=time.split(':').map(Number);if(!Number.isInteger(hour)||hour<0||hour>23||!Number.isInteger(minute)||minute<0||minute>59)throw new Error('请选择正确的提醒时间');
  const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
  if(action==='calendarReminder'){
   const start=new Date();start.setHours(hour,minute,0,0);if(start<=new Date())start.setDate(start.getDate()+1);const end=new Date(+start+10*60000);
   const params=new URLSearchParams({action:'TEMPLATE',text:'词巢 · 每天五个单词',dates:date(start)+'/'+date(end),ctz:timezone,recur:'RRULE:FREQ=DAILY',details:'每天学习5个新词，复习5个旧词。\n'+new URL('./',location.href).href});
   window.open('https://calendar.google.com/calendar/render?'+params,'_blank','noopener');
   const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//WordNest//Daily Learning//ZH','BEGIN:VEVENT','UID:'+crypto.randomUUID()+'@wordnest','DTSTAMP:'+date(new Date()),'DTSTART:'+date(start),'DTEND:'+date(end),'RRULE:FREQ=DAILY','SUMMARY:词巢：每天五个单词','DESCRIPTION:'+new URL('./',location.href).href,'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:今天的五个单词等你来学','END:VALARM','END:VEVENT','END:VCALENDAR'];const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='WordNest-daily-reminder.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   save(time,'已打开日历设置并生成日历文件。请在日历中确认保存、每日重复和通知；此网站无法确认你是否已保存。');return;
  }
  if(!Cloud.enabled())throw new Error('家庭中转服务尚未部署，暂不能开启网页推送；可先使用日历提醒');
  if(name==='访客')throw new Error('请先输入学习昵称');
  if(!('Notification'in window)||!('PushManager'in window))throw new Error('此浏览器不支持网页推送，请使用安卓 Chrome 或日历提醒');
  if(action==='enablePush'&&await Notification.requestPermission()!=='granted')throw new Error('未获得通知权限，可在浏览器设置中允许，或改用日历提醒');
  const reg=await registration();let sub=await reg.pushManager.getSubscription();
  if(action==='disablePush'){if(sub){await Cloud.request('/api/subscribe',{username:name,subscription:sub.toJSON(),remove:true});await sub.unsubscribe();}save(time,'此设备的网页推送已关闭；日历提醒请在系统日历里取消。');return;}
  const key=await Cloud.request('/api/push-key');if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:from64(key.publicKey)});
  await Cloud.request('/api/subscribe',{username:name,subscription:sub.toJSON(),hour,minute,timezone});save(time,`已登记每天 ${time} 的网页推送，当前绑定：${name}。换学习者后请重新开启以更新绑定。`);
 }};
})();
