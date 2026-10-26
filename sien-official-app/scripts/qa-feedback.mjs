import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
const base='http://127.0.0.1:3002', orderId='qa-feedback-memo-'+Date.now();
const db=new PrismaClient({datasources:{db:{url:'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true'}}});
const cookies=new Map();
async function call(url,options={}) {
 const response=await fetch(base+url,{...options,redirect:'manual',headers:{Origin:base,Cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; '),...options.headers}});
 for(const cookie of response.headers.getSetCookie()){const [k,v]=cookie.split(';')[0].split(/=(.*)/s);cookies.set(k,v);}
 return response;
}
try {
 assert.match((await db.siteSetting.findUnique({where:{id:'default'}})).announcement,/QA隔離環境/);
 const endpoint='/api/admin/orders/'+orderId+'/feedback';
 assert.equal((await call(endpoint)).status,401);
 assert.equal((await call(endpoint,{method:'PUT',body:'{}'})).status,401);
 const csrf=await(await call('/api/auth/csrf')).json();
 await call('/api/auth/callback/credentials',{method:'POST',body:new URLSearchParams({csrfToken:csrf.csrfToken,username:'qa-admin',password:'qa-only-password',callbackUrl:base+'/admin',json:'true'})});
 await db.order.create({data:{id:orderId,clientName:'QAメモ確認',clientEmail:'qa-memo@example.invalid',songTitle:'メモ専用テスト',serviceType:'MIX'}});
 const keys=['noise','room','level','mic','pitch','rhythm','words','expression'];
 const original={date:'2026-10-27',memo:'前のメモ',comparison:'first',summary:'保存済みの評価文章',strengths:'保存済みの長所',items:Object.fromEntries(keys.map(k=>[k,{rating:'確認対象外',comment:''}])),priorities:[],changes:'',closing:'',customMarker:'preserve-this'};
 await db.orderFeedback.create({data:{orderId,content:original}});
 const memo={memo:'・ノイズ目立つ\n・語尾きれい',date:'2026-10-27',comparison:'first'};
 const put=(body,origin=base)=>call(endpoint,{method:'PUT',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
 assert.equal((await put({...memo,version:1},'https://untrusted.invalid')).status,401);
 for(const bad of [{...memo,date:'2026-02-30'}, {...memo,comparison:'invalid'}, {...memo,memo:' '}, {...memo,memo:'あ'.repeat(6001)}]) assert.equal((await put({...bad,version:1})).status,400);
 assert.equal((await put({...memo,version:1,summary:'上書きしない'})).status,200);
 const stored=await db.orderFeedback.findUnique({where:{orderId}});
 assert.equal(stored.version,2);assert.equal(stored.content.memo,memo.memo);
 assert.equal(stored.content.summary,original.summary);assert.equal(stored.content.customMarker,'preserve-this');
 assert.equal((await put({...memo,version:1})).status,409);
 assert.equal((await call(endpoint)).status,405);
 const html=await(await call('/admin/orders/'+orderId+'/feedback')).text();
 assert.ok(html.includes('Codex用にメモをコピー'));
 for(const removed of ['保存してPDFダウンロード','内容プレビュー','手入力・項目別編集を開く','ノイズの評価','内容を確認・修正しました']) assert.ok(!html.includes(removed),removed);
 assert.ok(!html.includes(original.summary));
 console.log(JSON.stringify({result:'PASS',orderId,checks:['admin auth','cross-origin rejection','memo validation','save persistence','existing report preserved','version conflict','PDF endpoint removed (405)','memo-only page']}));
}finally{await db.$disconnect();}
