/* Completed-workout analytics. Never infer historical sets from today's plan. */
const TrainingInsights = (() => {
  const groups={chest:'Chest',delts:'Shoulders',reardelts:'Rear delts',traps:'Traps',lats:'Back / Lats',lowerback:'Lower back',biceps:'Biceps',triceps:'Triceps',forearms:'Forearms',abs:'Abs / Core',obliques:'Obliques',quads:'Quads',hams:'Hamstrings',glutes:'Glutes',calves:'Calves'};
  const aliases={'chest':'chest','upper chest':'chest','shoulders':'delts','side delts':'delts','front delts':'delts','rear delts':'reardelts','traps':'traps','upper back':'traps','back':'lats','lats':'lats','middle back':'lats','lower back':'lowerback','biceps':'biceps','triceps':'triceps','forearms':'forearms','core':'abs','abs':'abs','lower abs':'abs','obliques':'obliques','quads':'quads','hamstrings':'hams','glutes':'glutes','calves':'calves'};
  const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  function week(log={},offset=0,now=new Date()){
    const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-(start.getDay()+6)%7+offset*7);
    const rows=Object.entries(groups).map(([id,name])=>({id,name,primary:0,secondary:0,sets:0,days:new Set(),entries:[]}));
    const lookup=Object.fromEntries(rows.map(r=>[r.id,r]));
    const days=[];let total=0,sets=0,missingSets=0,legacy=0,unmapped=0;
    for(let i=0;i<7;i++){
      const date=new Date(start);date.setDate(date.getDate()+i);
      const ds=key(date),entries=Array.isArray(log[ds])?log[ds]:[];
      const day={date:ds,label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],entries,exercises:entries.length,sets:0,future:ds>key(now)};
      for(const entry of entries){
        total++;
        const muscles=Array.isArray(entry.muscles)?entry.muscles:[entry.m||''];
        if(!Array.isArray(entry.muscles))legacy++;
        const primary=aliases[String(muscles[0]||'').trim().toLowerCase()];
        const secondary=[...new Set(muscles.slice(1).map(m=>aliases[String(m).trim().toLowerCase()]).filter(id=>id&&id!==primary))];
        const known=Number.isFinite(entry.sets)&&entry.sets>0&&entry.type!=='cardio';
        if(known){sets+=entry.sets;day.sets+=entry.sets;}
        else if(entry.type!=='cardio')missingSets++;
        if(!primary)unmapped++;
        for(const id of [primary,...secondary].filter(Boolean)){
          const row=lookup[id],isPrimary=id===primary;
          row[isPrimary?'primary':'secondary']++;
          if(isPrimary&&known)row.sets+=entry.sets;
          row.days.add(ds);row.entries.push({entry,date:ds,primary:isPrimary});
        }
      }
      days.push(day);
    }
    return {start:key(start),end:days[6].date,days,rows,total,sets,missingSets,legacy,unmapped,activeDays:days.filter(d=>d.exercises).length,coverage:rows.filter(r=>r.primary||r.secondary).length};
  }
  return {week,groups};
})();
if(typeof module!=='undefined')module.exports=TrainingInsights;
