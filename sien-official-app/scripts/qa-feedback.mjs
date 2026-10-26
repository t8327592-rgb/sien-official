import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';
const base='http://127.0.0.1:3002', orderId='qa-feedback-api-'+Date.now();
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
 const csrf=await (await call('/api/auth/csrf')).json();
 await call('/api/auth/callback/credentials',{method:'POST',body:new URLSearchParams({csrfToken:csrf.csrfToken,username:'qa-admin',password:'qa-only-password',callbackUrl:base+'/admin',json:'true'})});
 await db.order.create({data:{id:orderId,clientName:'PDF確認クライアント',clientEmail:'qa-pdf@example.invalid',songTitle:'夜明けのサンプル',serviceType:'MIX'}});
 const keys=['noise','room','level','mic','pitch','rhythm','words','expression'];
 const content={memo:'検証用の管理メモ',comparison:'first',reviewed:true,aiQuestions:[],date:'2026-10-27',summary:'サビの強弱が明確で、曲の盛り上がりが伝わります。次回は部屋の響きを整えると、さらに聴きやすくなりそうです。',strengths:'語尾まで声が安定しており、歌詞が聞き取りやすいです。',items:Object.fromEntries(keys.map(k=>[k,{rating:'良好',comment:'今回確認した範囲では、目立つ問題はありません。'}])),priorities:[{title:'部屋の響きを抑える',observation:'Aメロの語尾に響きが残っています。',action:'厚手のカーテンがある場所で試し録りし、語尾の響きを比べてみてください。'}],changes:'前回より語尾の明瞭さが向上しています。曲や録音条件の違いがあるため、確認できる範囲で比較しています。',closing:'まずは部屋の響きを確認してみてください。今回の強弱の付け方も活かしていきましょう。'};
 content.items.room={rating:'少し気になる',comment:'Aメロの語尾に、部屋の反射と思われる響きが残っています。'};
 async function put(content,version,origin=base){return call(endpoint,{method:'PUT',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({content,version})});}
 assert.equal((await put(content,0,'https://untrusted.invalid')).status,401);
 assert.equal((await put({...content,date:'2026-02-30'},0)).status,400);
 assert.equal((await put({...content,summary:''},0)).status,200);
 assert.equal((await call(endpoint)).status,400);
 assert.equal((await put(content,1)).status,200);
 assert.equal((await put(content,1)).status,409);
 const stored=await db.orderFeedback.findUnique({where:{orderId}});assert.equal(stored.version,2);
 const response=await call(endpoint);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/pdf/);assert.match(response.headers.get('cache-control'),/no-store/);
 fs.mkdirSync('../audit/feedback-2026-10-27',{recursive:true});
 const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.subarray(0,5).toString(),'%PDF-');fs.writeFileSync('../audit/feedback-2026-10-27/generated.pdf',bytes);
 content.items.noise.comment=('長いコメントと改行の確認です。\n').repeat(25);
 content.summary='長い総評の折り返し確認です。'.repeat(65);
 assert.equal((await put(content,2)).status,200);
 const long=await call(endpoint);assert.equal(long.status,200);fs.writeFileSync('../audit/feedback-2026-10-27/long.pdf',Buffer.from(await long.arrayBuffer()));
 console.log('PASS: admin auth, cross-origin rejection, input validation, draft persistence, incomplete export blocked, concurrent save conflict, Japanese PDF download, long comments');
} finally {await db.$disconnect();}
