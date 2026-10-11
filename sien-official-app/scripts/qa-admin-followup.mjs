import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const base = 'http://127.0.0.1:3002';
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const cookies = new Map();
async function call(url, options = {}) {
  const response = await fetch(base + url, { ...options, redirect: 'manual', headers: { Origin: base, Cookie: [...cookies].map(([key,value]) => `${key}=${value}`).join('; '), ...options.headers } });
  for (const cookie of response.headers.getSetCookie()) { const [key,value] = cookie.split(';')[0].split(/=(.*)/s); cookies.set(key,value); }
  return response;
}
const results=[];
try {
  assert.match((await prisma.siteSetting.findUnique({where:{id:'default'}})).announcement,/QA隔離環境/);
  const csrf=await(await call('/api/auth/csrf')).json();
  await call('/api/auth/callback/credentials',{method:'POST',body:new URLSearchParams({csrfToken:csrf.csrfToken,username:'qa-admin',password:'qa-only-password',callbackUrl:base+'/admin',json:'true'})});
  assert.equal((await call('/admin')).status,200);
  for (const [id,status] of [['qa-followup-cancel','CANCELED'],['qa-followup-working','WORKING'],['qa-followup-archive','COMPLETED']]) {
    await prisma.order.upsert({where:{id},create:{id,status,clientName:id,clientEmail:'followup@example.invalid',serviceType:'MIX',price:1000,basePrice:1000,optionPrice:0,isArchived:id.endsWith('archive'),deadline:'2026-10-01'},update:{status,isArchived:id.endsWith('archive')}});
  }
  const patch=(id,body)=>call('/api/admin/orders/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await patch('qa-followup-cancel',{isArchived:true})).status,200);
  assert.equal((await prisma.order.findUnique({where:{id:'qa-followup-cancel'}})).isArchived,true);
  assert.ok((await(await call('/admin/orders?archive=1')).text()).includes('qa-followup-cancel'));
  assert.equal((await patch('qa-followup-cancel',{isArchived:false})).status,200);
  assert.equal((await prisma.order.findUnique({where:{id:'qa-followup-cancel'}})).isArchived,false);
  results.push('隔離DBでアーカイブ→一覧→復元を確認');
  if(process.argv.includes('--repeater')) {
    for(const value of [true,false]) {
      const response=await call('/api/admin/orders/qa-followup-working/repeater',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({isRepeater:value})});
      assert.equal(response.status,200);
      const rows=await prisma.order.findMany({where:{clientEmail:'followup@example.invalid'}});
      assert.equal(rows.length,3);assert.ok(rows.every(row=>row.isRepeater===value));
    }
    results.push('同メールの通常・アーカイブ・キャンセルを新規/リピーター両方向へ永続化');
  }
  if(process.argv.includes('--notifications')) {
    for(let index=0;index<27;index++) {
      const id='qa-notice-'+String(index).padStart(3,'0');
      await prisma.order.upsert({where:{id},create:{id,clientName:'QA通知検証',clientEmail:'notify@example.invalid',serviceType:'MIX'},update:{}});
      await prisma.notificationJob.upsert({where:{id},create:{id,entityId:id,kind:'ORDER_ADMIN_EMAIL',status:'FAILED',attempts:2,lastError:'QA用配送失敗'},update:{status:'FAILED',attempts:2,lockedUntil:null}});
      await prisma.submissionReceipt.upsert({where:{entityType_entityId:{entityType:'ORDER',entityId:id}},create:{entityType:'ORDER',entityId:id,requestKey:id,payloadHash:'qa',quote:{}},update:{}});
    }
    const before=await(await fetch('http://127.0.0.1:55433/captures')).json();
    const retry=await call('/api/admin/notifications/qa-notice-001/retry',{method:'POST'});
    assert.equal(retry.status,200);assert.equal((await retry.json()).status,'DELIVERED');
    assert.equal((await prisma.notificationJob.findUnique({where:{id:'qa-notice-000'}})).status,'FAILED');
    const after=await(await fetch('http://127.0.0.1:55433/captures')).json();assert.equal(after.mail.length-before.mail.length,1);
    assert.equal((await call('/api/admin/notifications/qa-notice-001/retry',{method:'POST'})).status,409);
    const list=await(await call('/admin/notifications?status=failed')).text();assert.ok(list.includes('次の25件'));
    const search=await(await call('/admin/notifications?status=failed&q=QA通知検証')).text();assert.ok(search.includes('QA通知検証'));
    results.push('通知個別再送は指定1件のみをローカルSMTPへ配送・送信済み再送拒否・ページ送り・依頼者名検索');
  }
  const report={testedAt:new Date().toISOString(),isolated:true,results};
  fs.mkdirSync(path.resolve(import.meta.dirname,'../../audit/checks/admin-followup-2026-10-11'),{recursive:true});
  fs.writeFileSync(path.resolve(import.meta.dirname,'../../audit/checks/admin-followup-2026-10-11/api-regression.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally {await prisma.$disconnect();}
