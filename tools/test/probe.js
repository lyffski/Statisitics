// Hilfsskript: KaTeX-Fehler und Überlauf-Elemente genauer anzeigen
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright')}catch(e){pw=require('/opt/node22/lib/node_modules/playwright')}
const LIBS=process.env.LIBS;
(async()=>{const b=await pw.chromium.launch();const w=+(process.env.W||390);const p=await b.newPage({viewport:{width:w,height:800}});
await p.route(/KaTeX\/0\.16\.9\/(.*)$/,(r,q)=>{const m=q.url().match(/KaTeX\/0\.16\.9\/(.*)$/);r.fulfill({path:path.join(LIBS,'katex-0.16.9','dist',m[1])})});
await p.route(/plotly-2\.27\.0/,r=>r.fulfill({path:path.join(LIBS,'plotly.js-dist-min-2.27.0','plotly.min.js')}));
await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForTimeout(700);
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const o=[];const W=innerWidth;document.querySelectorAll('body *').forEach(e=>{const rc=e.getBoundingClientRect();if(rc.right>W+1&&!e.closest('.katex-display')&&!e.closest('.katex-mathml')){o.push(e.tagName+'.'+e.className+' right='+Math.round(rc.right)+' | '+(e.textContent||'').slice(0,60))}});
return {err:[...document.querySelectorAll('.katex-error')].map(e=>e.textContent.slice(0,300)),o:o.slice(0,25)}});
console.log(JSON.stringify(r,null,1));await b.close()})();
