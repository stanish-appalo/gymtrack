const {test}=require('node:test');
const assert=require('node:assert/strict');
const {week}=require('../assets/insights.js');
const now=new Date(2026,9,7,12);
test('Monday boundaries include Sunday and exclude adjacent weeks',()=>{
  const data=week({'2026-10-04':[{}],'2026-10-05':[{}],'2026-10-11':[{}],'2026-10-12':[{}]},0,now);
  assert.equal(data.start,'2026-10-05');assert.equal(data.end,'2026-10-11');assert.equal(data.total,2);
  assert.equal(week({},0,new Date(2026,9,11,23,59)).start,'2026-10-05');
  assert.equal(week({},-1,now).start,'2026-09-28');
  assert.equal(week({},0,new Date(2026,0,1,12)).start,'2025-12-29');
});
test('primary, supporting, aliases and sets aggregate separately without duplicate muscles',()=>{
  const data=week({'2026-10-05':[{muscles:['Upper Chest','Triceps','Triceps','Chest'],sets:3,type:'compound'}],'2026-10-06':[{muscles:['Chest','Front Delts'],sets:4,type:'compound'}]},0,now);
  const row=id=>data.rows.find(r=>r.id===id);
  assert.equal(data.total,2);assert.equal(data.sets,7);assert.equal(data.activeDays,2);assert.equal(data.coverage,3);
  assert.equal(row('chest').primary,2);assert.equal(row('chest').secondary,0);assert.equal(row('chest').sets,7);
  assert.equal(row('triceps').primary,0);assert.equal(row('triceps').secondary,1);assert.equal(row('triceps').sets,0);
  assert.equal(row('delts').secondary,1);assert.equal(row('chest').days.size,2);
});
test('legacy history stays unknown rather than fabricating sets or supporting muscles',()=>{
  const data=week({'2026-10-05':[{m:'Biceps',id:'old-curl',name:'Old curl'},{m:'Unknown custom muscle'}]},0,now);
  assert.equal(data.legacy,2);assert.equal(data.missingSets,2);assert.equal(data.sets,0);assert.equal(data.unmapped,1);
  assert.equal(data.rows.find(r=>r.id==='biceps').primary,1);
  assert.equal(data.rows.reduce((n,r)=>n+r.secondary,0),0);
});
test('cardio is activity but not lifting sets; empty weeks are honest zeros',()=>{
  const data=week({'2026-10-05':[{muscles:['Fat-loss'],type:'cardio',sets:1}]},0,now);
  assert.equal(data.total,1);assert.equal(data.sets,0);assert.equal(data.missingSets,0);assert.equal(data.coverage,0);
  assert.equal(week({},0,now).total,0);assert.equal(week({},0,now).rows.length,15);
});
