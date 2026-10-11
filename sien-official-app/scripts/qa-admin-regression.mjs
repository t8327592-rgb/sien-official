import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const base = 'http://127.0.0.1:3002';
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const cookies = new Map();
async function call(url, options = {}) {
  const response = await fetch(base + url, { ...options, redirect: 'manual', headers: { Origin: base, Cookie: [...cookies].map(([key,value]) => `${key}=${value}`).join('; '), ...options.headers } });
  for (const cookie of response.headers.getSetCookie()) {
    const [key,value] = cookie.split(';')[0].split(/=(.*)/s); cookies.set(key,value);
  }
  return response;
}
const results = [];
try {
  assert.match((await prisma.siteSetting.findUnique({ where: { id: 'default' } })).announcement, /QA隔離環境/);
  const csrf = await (await call('/api/auth/csrf')).json();
  await call('/api/auth/callback/credentials', { method:'POST', body:new URLSearchParams({ csrfToken:csrf.csrfToken, username:'qa-admin', password:'qa-only-password', callbackUrl:base+'/admin', json:'true' }) });
  assert.equal((await call('/admin')).status,200);
  results.push('管理者ログイン・認証済み読み取り');
  const id='qa-admin-'+randomUUID();
  await prisma.order.create({ data:{id,clientName:'QA管理検証',clientEmail:'qa@example.invalid',serviceType:'MIX',status:'WORKING',basePrice:1000,optionPrice:0,price:1000} });
  async function patch(body) { return call('/api/admin/orders/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); }
  const before=await prisma.order.findUnique({where:{id}});
  for(const body of [{status:'INVALID'},{price:-1},{price:1.5},{price:5},{deadline:'2026-02-30'},{isArchived:'true'},{paymentMethod:'unknown'}]) assert.equal((await patch(body)).status,400);
  assert.equal((await prisma.order.findUnique({where:{id}})).updatedAt.toISOString(),before.updatedAt.toISOString());
  results.push('不正入力7種類を400で拒否しDB更新なし');
  for(const status of ['WAITING_PAYMENT','CANCELLED','WORKING']) {
    const response=await patch({status});assert.equal(response.status,200);
    assert.equal((await response.json()).order.status,status==='CANCELLED'?'CANCELED':status);
  }
  assert.equal((await patch({paymentMethod:'bank_transfer'})).status,200);
  assert.equal((await prisma.order.findUnique({where:{id}})).paymentMethod,'銀行振込');
  results.push('入金待ち・旧キャンセル値・支払方法の正規化を保存');
  assert.equal((await patch({optionPrice:500})).status,200);
  assert.equal((await prisma.order.findUnique({where:{id}})).price,1500);
  results.push('内訳更新時にサーバーで合計再計算');
  const archivedId='qa-archived-'+randomUUID();
  await prisma.order.create({data:{id:archivedId,clientName:'QAアーカイブ売上',clientEmail:'qa@example.invalid',serviceType:'MIX',status:'COMPLETED',price:2000,basePrice:2000,optionPrice:0,isArchived:true,deliveredAt:new Date()}});
  const finance=await (await call('/admin/finance')).text();
  assert.ok(finance.includes(id));assert.ok(finance.includes(archivedId));
  const rows=await prisma.order.findMany({where:{status:{notIn:['CANCELED','CANCELLED']}}});
  const createdTotal=rows.reduce((sum,row)=>sum+(row.price??0),0);
  const deliveredTotal=rows.filter(row=>row.status==='COMPLETED'&&row.deliveredAt).reduce((sum,row)=>sum+(row.price??0),0);
  results.push('売上画面に進行中とアーカイブ済み売上を含む');
  const draft=await prisma.plan.findFirst({where:{name:'QA公開確認プラン'}});
  assert.ok(draft?.isActive);assert.equal(draft.price,0);
  results.push('ブラウザーで下書き→公開した0円プランの永続化');
  const report={testedAt:new Date().toISOString(),isolated:true,results,finance:{createdTotal,deliveredTotal}};
  fs.writeFileSync(path.resolve(import.meta.dirname,'../../audit/checks/admin-high-2026-10-11/api-regression.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally { await prisma.$disconnect(); }
