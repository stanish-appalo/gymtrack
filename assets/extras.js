/* GymTrack extras: rest/set timer, drag to reorder, logging past workouts.
   Loaded after the main script, so it uses its globals (state, save, render, esc, toast...). */
(function(){
const pad=n=>String(n).padStart(2,'0');
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+pad(s%60);};

/* ================= TIMER ================= */
const T={mode:'rest',endAt:0,left:0,running:false,startAt:0,elapsed:0,tick:null,lock:null};
document.body.insertAdjacentHTML('beforeend',`
<button class="timerfab" id="timerFab" aria-label="Timer"><span class="tfi">⏱</span><span class="tft" id="timerFabTxt"></span></button>
<div class="sheet" id="timerSheet"><div class="grab"></div><button class="closeX" data-close>✕</button><div class="sheetpad" id="timerBody"></div></div>
<div class="sheet" id="pastSheet"><div class="grab"></div><button class="closeX" data-close>✕</button><div class="sheetpad" id="pastBody"></div></div>`);
document.querySelectorAll('#timerSheet [data-close],#pastSheet [data-close]').forEach(b=>b.addEventListener('click',()=>closeSheets()));

function restSec(){return (state.settings&&state.settings.restSec)||90;}
function beep(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C();
  [0,0.35,0.7].forEach(t=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=880;o.connect(g);g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001,ctx.currentTime+t);g.gain.exponentialRampToValueAtTime(0.4,ctx.currentTime+t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+t+0.25);
    o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+0.3);});setTimeout(()=>ctx.close(),1500);}catch(e){}}
async function keepAwake(on){try{if(on&&!T.lock&&navigator.wakeLock)T.lock=await navigator.wakeLock.request('screen');
  if(!on&&T.lock){await T.lock.release();T.lock=null;}}catch(e){}}
function current(){if(T.mode==='rest')return T.running?(T.endAt-Date.now())/1000:T.left;
  return T.running?T.elapsed+(Date.now()-T.startAt)/1000:T.elapsed;}
function loop(){clearInterval(T.tick);T.tick=setInterval(update,250);update();}
function update(){
  if(T.mode==='rest'&&T.running&&Date.now()>=T.endAt){T.running=false;T.left=0;clearInterval(T.tick);keepAwake(false);
    if(navigator.vibrate)navigator.vibrate([300,150,300,150,300]);beep();toast('⏱ Rest over. Next set 💪');}
  const fab=document.getElementById('timerFab'),txt=document.getElementById('timerFabTxt'),active=T.running;
  fab.classList.toggle('on',active);txt.textContent=active?fmt(current()):'';
  const big=document.getElementById('tBig');if(big)big.textContent=fmt(current());
  const go=document.getElementById('tGo');if(go)go.textContent=T.running?'⏸ Pause':(T.mode==='rest'&&T.left<=0?'▶ Start':(current()>0?'▶ Resume':'▶ Start'));
  if(!T.running)clearInterval(T.tick);
}
window.startRest=function(sec){T.mode='rest';T.left=sec;T.endAt=Date.now()+sec*1000;T.running=true;keepAwake(true);loop();};
function renderTimer(){const r=restSec();
  document.getElementById('timerBody').innerHTML=`<div class="dtitle">Timer</div>
    <div class="pchips tmodes"><button type="button" class="pchip ${T.mode==='rest'?'on':''}" data-tmode="rest">Rest countdown</button><button type="button" class="pchip ${T.mode==='set'?'on':''}" data-tmode="set">Set stopwatch</button></div>
    <div class="tbig" id="tBig">${fmt(current())}</div>
    ${T.mode==='rest'?`<div class="tpresets">${[30,45,60,90,120,180].map(s=>`<button type="button" class="pchip ${s===r?'on':''}" data-tset="${s}">${s<60?s+'s':fmt(s)}</button>`).join('')}</div>
      <div class="btnrow"><button class="btn ghost" data-tadd="-15">-15s</button><button class="btn ghost" data-tadd="15">+15s</button></div>`:''}
    <div class="btnrow" style="margin-top:12px"><button class="btn primary" id="tGo">▶ Start</button><button class="btn ghost" id="tReset">↺ Reset</button></div>
    <div class="toggle ${state.settings.autoRest?'on':''}" id="tAuto"><div class="sw"></div><div>Start a ${fmt(r)} rest automatically when I tick off an exercise</div></div>
    <p class="muted" style="margin-top:12px">The phone vibrates and beeps when rest ends, and the screen stays on while the timer runs. Tap a preset to make it your default rest.</p>`;
  update();}
document.getElementById('timerFab').addEventListener('click',()=>{renderTimer();openSheet('#timerSheet');});
document.getElementById('timerSheet').addEventListener('click',ev=>{const t=ev.target;
  const m=t.closest('[data-tmode]');if(m&&m.dataset.tmode!==T.mode){T.running=false;clearInterval(T.tick);keepAwake(false);T.mode=m.dataset.tmode;T.left=T.mode==='rest'?restSec():0;T.elapsed=0;renderTimer();return;}
  const p=t.closest('[data-tset]');if(p){state.settings.restSec=+p.dataset.tset;save();window.startRest(restSec());renderTimer();return;}
  const a=t.closest('[data-tadd]');if(a){const d=+a.dataset.tadd;if(T.running)T.endAt=Math.max(Date.now(),T.endAt+d*1000);else T.left=Math.max(0,(T.left||restSec())+d);update();return;}
  if(t.closest('#tGo')){
    if(T.mode==='rest'){if(T.running){T.left=current();T.running=false;keepAwake(false);}else window.startRest(T.left>0?T.left:restSec());}
    else{if(T.running){T.elapsed=current();T.running=false;keepAwake(false);}else{T.startAt=Date.now();T.running=true;keepAwake(true);loop();}}
    update();return;}
  if(t.closest('#tReset')){T.running=false;keepAwake(false);T.left=T.mode==='rest'?restSec():0;T.elapsed=0;update();return;}
  if(t.closest('#tAuto')){state.settings.autoRest=!state.settings.autoRest;save();t.closest('#tAuto').classList.toggle('on',state.settings.autoRest);}
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&T.running){keepAwake(true);update();}});
// called by the main script after an exercise is ticked off
window.onExerciseChecked=function(e){if(state.settings.autoRest&&e.type!=='cardio')window.startRest(restSec());};

/* ================= DRAG TO REORDER (edit mode) ================= */
const list=document.getElementById('list');let drag=null;
list.addEventListener('pointerdown',ev=>{const g=ev.target.closest('[data-drag]');if(!g||!document.body.classList.contains('editing'))return;
  ev.preventDefault();const rows=[...list.querySelectorAll('.ex')],row=g.closest('.ex'),from=rows.indexOf(row);if(from<0)return;
  const tops=rows.map(r=>r.getBoundingClientRect().top+scrollY),hs=rows.map(r=>r.offsetHeight);
  // other rows slide by the dragged row height plus the list gap
  const gap=rows.length>1?tops[1]-tops[0]-hs[0]:0,step=hs[from]+gap;
  drag={rows,row,from,to:from,tops,hs,step,startY:ev.clientY+scrollY,y:ev.clientY,scroll:null,id:ev.pointerId};
  try{g.setPointerCapture(ev.pointerId);}catch(e){}
  row.classList.add('dragging');document.body.classList.add('dragmode');
  drag.scroll=setInterval(()=>{if(!drag)return;const edge=90;if(drag.y<edge)scrollBy(0,-10);else if(drag.y>innerHeight-edge-80)scrollBy(0,10);moveTo(drag.y);},30);
});
function moveTo(clientY){const d=drag,dy=clientY+scrollY-d.startY;d.row.style.transform=`translateY(${dy}px)`;
  const mid=d.tops[d.from]+d.hs[d.from]/2+dy;let to=0;
  d.tops.forEach((t,i)=>{if(i!==d.from&&mid>t+d.hs[i]/2)to++;});d.to=to;
  d.rows.forEach((r,i)=>{if(i===d.from)return;let s=0;if(d.from<to&&i>d.from&&i<=to)s=-d.step;if(d.from>to&&i<d.from&&i>=to)s=d.step;r.style.transform=s?`translateY(${s}px)`:'';});}
list.addEventListener('pointermove',ev=>{if(!drag||ev.pointerId!==drag.id)return;drag.y=ev.clientY;moveTo(ev.clientY);});
function endDrag(){if(!drag)return;const d=drag;drag=null;clearInterval(d.scroll);document.body.classList.remove('dragmode');
  d.rows.forEach(r=>{r.style.transform='';r.classList.remove('dragging');});
  if(d.to!==d.from){const l=state.plan[activeDay],[it]=l.splice(d.from,1);l.splice(d.to,0,it);save();if(navigator.vibrate)navigator.vibrate(10);}
  renderList();}
list.addEventListener('pointerup',endDrag);list.addEventListener('pointercancel',endDrag);

/* ================= LOG A PAST WORKOUT ================= */
let P={date:null,rows:[],q:''};
function yesterday(){const d=new Date();d.setDate(d.getDate()-1);return dateStr(d);}
function entryCal(w){return estCalW({type:w.type||'isolation',sets:w.sets||3,reps:w.reps||'12',name:w.name},w.weight||0);}
function stableId(x){return x.planEx?x.planEx.id:x.id.replace(/^lib-/,'')+'-past';}
window.openPastLog=function(date){P={date:date||yesterday(),rows:[],q:''};renderPast();openSheet('#pastSheet');};
function renderPast(){const logged=(state.workoutLog||{})[P.date]||[],today=dateStr(new Date());
  document.getElementById('pastBody').innerHTML=`<div class="dtitle">Log a past workout</div>
    <div class="field"><span class="lbl">Date</span><input type="date" id="pDate" max="${today}" value="${P.date}"></div>
    <div class="sectlbl">Already logged on ${esc(fmtDate(P.date))}</div>
    ${logged.length?logged.map((w,i)=>`<div class="prow"><div class="exinfo"><div class="exname">${esc(w.name)}</div><div class="muted">${w.sets?w.sets+' × '+esc(w.reps||''):''}${w.weight!=null?' · '+w.weight+(w.unit||'kg'):''} · 🔥 ${entryCal(w)} kcal</div></div><button class="mini del" data-prm="${i}" aria-label="Remove">✕</button></div>`).join(''):'<div class="hmut">Nothing yet.</div>'}
    <div class="sectlbl">Add exercises</div>
    <div class="pchips">${DAYS.map(d=>`<button type="button" class="pchip" data-pcopy="${d}">Copy ${DLABEL[d]}</button>`).join('')}</div>
    <div class="libsearch" style="margin-top:10px"><input id="pQ" type="search" autocomplete="off" placeholder="🔎 Search exercises to add" value="${esc(P.q)}"></div>
    <div id="pRes"></div>
    <div id="pRows">${P.rows.map((r,i)=>`<div class="prow edit"><div class="exinfo"><div class="exname">${esc(r.name)}</div>
      <div class="pin"><label>Sets<input type="number" min="1" inputmode="numeric" data-pf="sets" data-pi="${i}" value="${r.sets}"></label><label>Reps<input data-pf="reps" data-pi="${i}" value="${esc(r.reps)}"></label>${r.type==='cardio'?'':`<label>kg<input type="number" step="0.5" inputmode="decimal" data-pf="weight" data-pi="${i}" value="${r.weight==null?'':r.weight}"></label>`}</div></div>
      <button class="mini del" data-prow="${i}" aria-label="Remove">✕</button></div>`).join('')}</div>
    ${P.rows.length?`<button class="btn primary" id="pSave">💾 Save ${P.rows.length} exercise${P.rows.length>1?'s':''} to ${esc(fmtDate(P.date))}</button>`:''}`;
  document.getElementById('pDate').addEventListener('change',ev=>{const v=ev.target.value;if(v&&v<=today){P.date=v;renderPast();}});
  document.getElementById('pQ').addEventListener('input',ev=>{P.q=ev.target.value;renderPastRes();});
  document.querySelectorAll('#pRows [data-pf]').forEach(inp=>inp.addEventListener('change',()=>{const r=P.rows[+inp.dataset.pi],f=inp.dataset.pf;
    r[f]=f==='sets'?Math.max(1,parseInt(inp.value)||1):f==='weight'?(inp.value===''?null:parseFloat(inp.value)):(inp.value.trim()||r.reps);}));
  renderPastRes();}
function renderPastRes(){const el=document.getElementById('pRes');const w=P.q.toLowerCase().split(/\s+/).filter(Boolean);
  if(!w.length){el.innerHTML='';return;}
  const hits=libItems().filter(x=>w.every(k=>(x.name+' '+x.muscles.join(' ')).toLowerCase().includes(k))).slice(0,12);
  el.innerHTML=hits.map(x=>`<button type="button" class="pres" data-padd="${x.id}">＋ ${esc(x.name)}</button>`).join('')||'<div class="hmut">No match.</div>';}
function addRow(src){const x=state.ex[src.id]||{};P.rows.push({id:src.id,name:src.name,sets:+src.sets||3,reps:src.reps||'12',type:src.type,muscles:(src.muscles||[]).slice(),weight:x.weight==null?null:x.weight});}
document.getElementById('pastSheet').addEventListener('click',ev=>{const t=ev.target;
  const ad=t.closest('[data-padd]');if(ad){const x=libFind(ad.dataset.padd);if(x){const base=x.planEx||{id:stableId(x),name:x.name,sets:3,reps:'12',type:x.type,muscles:x.muscles};addRow(base);P.q='';renderPast();}return;}
  const cp=t.closest('[data-pcopy]');if(cp){const l=(state.plan[cp.dataset.pcopy]||[]).filter(e=>partOf(e)!=='rest');l.forEach(addRow);toast(l.length+' exercises from '+FULLDAY[cp.dataset.pcopy]);renderPast();return;}
  const rr=t.closest('[data-prow]');if(rr){P.rows.splice(+rr.dataset.prow,1);renderPast();return;}
  const rm=t.closest('[data-prm]');if(rm){const arr=state.workoutLog[P.date],[w]=arr.splice(+rm.dataset.prm,1);
    state.calLog[P.date]=Math.max(0,Math.round((state.calLog[P.date]||0)-entryCal(w)));if(!arr.length)delete state.workoutLog[P.date];
    save();renderPast();if(activeView==='history')renderHistory();toast('Removed '+w.name);return;}
  if(t.closest('#pSave')){state.workoutLog=state.workoutLog||{};state.calLog=state.calLog||{};const arr=state.workoutLog[P.date]=state.workoutLog[P.date]||[];let kcal=0;
    for(const r of P.rows){const w={id:r.id,name:r.name,weight:r.weight,m:r.muscles[0]||'',muscles:r.muscles,sets:r.sets,reps:r.reps,type:r.type,unit:'kg',past:true};
      const old=arr.findIndex(o=>o.id===r.id);if(old>=0){state.calLog[P.date]-=entryCal(arr[old]);arr.splice(old,1);}
      arr.push(w);kcal+=entryCal(w);}
    state.calLog[P.date]=Math.max(0,Math.round((state.calLog[P.date]||0)+kcal));
    const n=P.rows.length;P.rows=[];save();renderPast();if(activeView==='history')renderHistory();if(activeView==='overview'&&window.renderOverview)renderOverview();
    toast(`Saved ${n} to ${fmtDate(P.date)} · 🔥 ${kcal} kcal`);}
});
// history gets a "log a past workout" button and an edit button per day
const _renderHistory=renderHistory;
renderHistory=function(){_renderHistory();const v=document.getElementById('historyView');
  const btn='<button class="addbtn pastbtn" data-pastlog="">＋ Log a past workout</button>';
  const wrap=v.querySelector('.muscwrap');if(wrap)wrap.querySelector('.msctitle').insertAdjacentHTML('afterend',btn);else v.insertAdjacentHTML('afterbegin',btn);
  v.querySelectorAll('.hcard[data-hdate]').forEach(c=>c.querySelector('.hdate').insertAdjacentHTML('beforeend',`<button class="hedit" data-pastlog="${c.dataset.hdate}" aria-label="Edit this day">✎</button>`));};
document.getElementById('historyView').addEventListener('click',ev=>{const b=ev.target.closest('[data-pastlog]');if(b)window.openPastLog(b.dataset.pastlog||null);});
})();
