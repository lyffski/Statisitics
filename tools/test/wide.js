// Findet das Element, das bei schmaler Breite die Seite verbreitert (versteckt Kandidaten nacheinander)
const path=require('path');let pw;try{pw=require('playwright')}catch(e){pw=require('/opt/node22/lib/node_modules/playwright')}
const LIBS=process.env.LIBS;
(async()=>{const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:+(process.env.W||390),height:800}});
await p.route(/KaTeX\/0\.16\.9\/(.*)$/,(r,q)=>{const m=q.url().match(/KaTeX\/0\.16\.9\/(.*)$/);r.fulfill({path:path.join(LIBS,'katex-0.16.9','dist',m[1])})});
await p.route(/plotly-2\.27\.0/,r=>r.fulfill({path:path.join(LIBS,'plotly.js-dist-min-2.27.0','plotly.min.js')}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForTimeout(700);
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.evaluate(()=>document.querySelectorAll('.tracer [data-a="last"]').forEach(b=>b.click()));await p.waitForTimeout(300);
console.log(await p.evaluate(()=>{const W=innerWidth;const s0=document.documentElement.scrollWidth;if(s0<=W)return 'ok';
 let cands=[...document.querySelectorAll('main > *')];const out=[];
 for(let depth=0;depth<8&&cands.length;depth++){const next=[];for(const e of cands){const d=e.style.display;e.style.display='none';const w=document.documentElement.scrollWidth;e.style.display=d;if(w<s0){next.push(...e.children);out.push('  '.repeat(depth)+e.tagName+'#'+e.id+'.'+String(e.className).slice(0,40)+' :: '+(e.textContent||'').slice(0,70).replace(/\s+/g,' '))}}cands=next}
 return s0+'\n'+out.join('\n')}));await b.close()})();
