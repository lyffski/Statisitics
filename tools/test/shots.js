// Screenshots einzelner Stellen: node shots.js datei.html out-prefix sel1 sel2 …  (W=Breite)
const path=require('path');let pw;try{pw=require('playwright')}catch(e){pw=require('/opt/node22/lib/node_modules/playwright')}
const LIBS=process.env.LIBS;
(async()=>{const [f,out,...sels]=process.argv.slice(2);const b=await pw.chromium.launch();const W=+(process.env.W||1920);
const p=await b.newPage({viewport:{width:W,height:1080}});
await p.route(/KaTeX\/0\.16\.9\/(.*)$/,(r,q)=>{const m=q.url().match(/KaTeX\/0\.16\.9\/(.*)$/);r.fulfill({path:path.join(LIBS,'katex-0.16.9','dist',m[1])})});
await p.route(/plotly-2\.27\.0/,r=>r.fulfill({path:path.join(LIBS,'plotly.js-dist-min-2.27.0','plotly.min.js')}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+path.resolve(f));await p.waitForTimeout(800);
for(const [i,s] of sels.entries()){
  if(s==='MENU'){await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.click('#lbOpen');await p.waitForTimeout(200);await p.screenshot({path:out+'-'+i+'-menu.png'});await p.keyboard.press('Escape');continue}
  const [sel,act]=s.split('!');
  await p.evaluate(([sel,act])=>{const e=document.querySelector(sel);if(!e)return;if(act==='open')e.querySelectorAll('details').forEach(d=>d.open=true);if(act&&act.startsWith('step')){const n=+act.slice(4);for(let k=0;k<n;k++)e.querySelector('[data-a="next"]').click()}e.scrollIntoView({block:'start',behavior:'instant'});window.scrollBy(0,-10)},[sel,act||'']);
  await p.waitForTimeout(400);
  const el=await p.$(sel); if(!el){console.log('fehlt',sel);continue}
  await el.screenshot({path:out+'-'+i+'.png'});
}
await b.close()})();
