const $=(id)=>document.getElementById(id);
function getData(){return {exam:$('exam').value,target:+$('target').value,listening:+$('listening').value,reading:+$('reading').value,writing:+$('writing').value,translation:+$('translation').value,days:+$('days').value,minutes:+$('minutes').value};}
function predict(d){
  const base=d.listening+d.reading+d.writing+d.translation;
  const efficiency=Math.min(1.18,0.82+d.days*0.004+d.minutes*0.0018);
  const predicted=Math.round(Math.min(710,base*efficiency+Math.sqrt(d.days*d.minutes)*0.38));
  const passProb=Math.max(8,Math.min(96,Math.round((predicted-365)/1.25)));
  const gaps=[['听力',249-d.listening],['阅读',249-d.reading],['写作',106-d.writing],['翻译',106-d.translation]].sort((a,b)=>b[1]-a[1]);
  return {base,predicted,passProb,weak:gaps[0][0],gap:d.target-predicted};
}
function drawChart(d){
  const ctx=$('chart').getContext('2d'), w=760,h=360; ctx.clearRect(0,0,w,h); ctx.font='18px Microsoft YaHei'; ctx.fillStyle='#16231b'; ctx.fillText('分项能力诊断',30,34);
  const labels=['听力','阅读','写作','翻译']; const vals=[d.listening/249,d.reading/249,d.writing/106,d.translation/106];
  const maxW=560; labels.forEach((lab,i)=>{const y=75+i*62;ctx.fillStyle='#66756b';ctx.fillText(lab,35,y+18);ctx.fillStyle='#e9f6ef';ctx.fillRect(100,y,maxW,26);ctx.fillStyle='#1f7a4d';ctx.fillRect(100,y,maxW*vals[i],26);ctx.fillStyle='#16231b';ctx.fillText(Math.round(vals[i]*100)+'%',680,y+20);});
}
function render(){const d=getData(), r=predict(d);$('predictedScore').textContent=r.predicted;$('passText').textContent=`通过概率约${r.passProb}%`;
  $('advice').className='advice-list';
  $('advice').innerHTML=`<div class="advice-item"><strong>当前基础分</strong><span>${r.base}分，预测分为${r.predicted}分。</span></div><div class="advice-item ${r.gap>0?'risk':''}"><strong>目标差距</strong><span>${r.gap>0?'距离目标仍差约'+r.gap+'分，需要提高练习强度。':'预测已达到目标，可转入稳定提升阶段。'}</span></div><div class="advice-item"><strong>薄弱模块</strong><span>${r.weak}提升空间最大，建议优先安排专项训练。</span></div><div class="advice-item"><strong>复习建议</strong><span>每日按“听力精听—阅读限时—写译复盘—词汇回看”执行，周末进行一次整卷模拟。</span></div>`; drawChart(d); localStorage.setItem('cet_last',JSON.stringify(d));}
function saveCheck(){const tasks=[...document.querySelectorAll('.check-grid input:checked')].map(i=>i.value);const arr=JSON.parse(localStorage.getItem('cet_check')||'[]');arr.unshift({time:new Date().toLocaleDateString(),tasks});localStorage.setItem('cet_check',JSON.stringify(arr.slice(0,10)));renderHistory();}
function renderHistory(){const arr=JSON.parse(localStorage.getItem('cet_check')||'[]');$('history').innerHTML=arr.length?arr.map(i=>`<div class="history-item"><strong>${i.time}</strong><small>完成${i.tasks.length}项</small><p>${i.tasks.join('、')||'未选择任务'}</p></div>`).join(''):'暂无打卡记录。';}
function load(){const d=JSON.parse(localStorage.getItem('cet_last')||'null');if(d){Object.keys(d).forEach(k=>{if($(k))$(k).value=d[k]});render()}renderHistory()}
$('predictBtn').onclick=render;$('saveCheck').onclick=saveCheck;$('reset').onclick=()=>{localStorage.removeItem('cet_check');renderHistory()};load();
