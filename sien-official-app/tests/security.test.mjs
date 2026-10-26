import { createRequire } from 'node:module';
const nativeRequire = createRequire(import.meta.url);
const { test } = nativeRequire('node:test');
const assert = nativeRequire('node:assert/strict');
const fs = nativeRequire('node:fs');
const path = nativeRequire('node:path');
const vm = nativeRequire('node:vm');
const ts = nativeRequire('typescript');
const root = path.resolve(import.meta.dirname, '..');

test('brace mitigation preserves ordinary glob expansion and rejects excessive nesting before recursion', () => {
  const braces = nativeRequire('braces');
  assert.deepEqual(braces.expand('src/{app,components}/*.{ts,tsx}'), [
    'src/app/*.ts', 'src/app/*.tsx', 'src/components/*.ts', 'src/components/*.tsx',
  ]);
  assert.equal(braces.compile('a/{b,c}/d'), 'a/(b|c)/d');
  assert.equal(braces.stringify('a/{b,c}/d'), 'a/{b,c}/d');
  for (const method of ['parse', 'compile', 'expand', 'stringify']) {
    for (const [open, close] of [['{', '}'], ['(', ')']]) {
      assert.throws(() => braces[method](open.repeat(4000) + 'a,b' + close.repeat(4000)), {
        name: 'SyntaxError', message: /safe depth limit/,
      });
    }
  }
});

test('brace AST entry points also reject deep or cyclic trees without stack exhaustion', () => {
  const braces = nativeRequire('braces');
  let ast = { type: 'text', value: 'x' };
  for (let depth = 0; depth < 2000; depth++) ast = { type: 'root', nodes: [ast] };
  const cyclic = { type: 'root', nodes: [] }; cyclic.nodes.push(cyclic);
  for (const method of ['compile', 'expand', 'stringify']) {
    assert.throws(() => braces[method](ast), { name: 'SyntaxError', message: /safe depth limit/ });
    assert.throws(() => braces[method](cyclic), { name: 'SyntaxError', message: /must be a tree/ });
  }
});

test('patched selector parser retains typography pseudo-element output', () => {
  const typographyRequire = createRequire(nativeRequire.resolve('@tailwindcss/typography'));
  assert.equal(typographyRequire('postcss-selector-parser/package.json').version, '7.1.6');
  const { commonTrailingPseudos } = typographyRequire('./utils');
  assert.deepEqual(commonTrailingPseudos('p::before, h2::before'), ['::before', 'p, h2']);
  assert.deepEqual(commonTrailingPseudos('p, h2'), [null, 'p, h2']);
});

function heroHarness(reducedMotion = false) {
  const timers = new Map();
  let nextTimer = 0, intersection, cleanup, plays = 0, pauses = 0;
  const video = Object.assign(new EventTarget(), {
    src: '',
    getAttribute() { return this.src || null; },
    play() { plays++; this.dispatchEvent(new Event('playing')); return Promise.resolve(); },
    pause() { pauses++; },
  });
  const document = Object.assign(new EventTarget(), { hidden: false });
  const motion = Object.assign(new EventTarget(), { matches: reducedMotion });
  const react = { useRef: () => ({ current: video }), useEffect: effect => { cleanup = effect(); } };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, 'src/components/ui/HeroVideoPlayer.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const compiled = { exports: {} };
  const context = {
    document, window: { matchMedia: () => motion },
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    IntersectionObserver: class {
      constructor(callback) { intersection = callback; }
      observe() {} disconnect() {}
    },
  };
  vm.runInNewContext(`(function(require,module,exports){${source}\n})`, context)(
    name => name === 'react' ? react : nativeRequire(name), compiled, compiled.exports,
  );
  const element = compiled.exports.HeroVideoPlayer({ src: '/test-hero.mp4' });
  return {
    video, document, motion, timers, element,
    get plays() { return plays; }, get pauses() { return pauses; },
    visible(value) { intersection([{ isIntersecting: value, intersectionRatio: value ? 1 : 0 }]); },
    cleanup: () => cleanup(),
  };
}

test('hero loads only when visible, loops without a stop deadline and resumes after scrolling back', () => {
  const hero = heroHarness();
  assert.equal(hero.video.src, '');
  assert.equal(hero.element.props.loop, true);
  assert.equal(hero.element.props.preload, 'none');
  hero.visible(true); assert.equal(hero.plays, 1);
  assert.equal(hero.video.src, '/test-hero.mp4');
  const pauses = hero.pauses;
  hero.visible(false); assert.equal(hero.pauses, pauses + 1);
  hero.visible(true); assert.equal(hero.plays, 2);
  assert.equal(hero.timers.size, 0);
  hero.cleanup(); assert.equal(hero.timers.size, 0);
  const plays = hero.plays;
  hero.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(hero.plays, plays);
});

test('hero respects reduced motion and resumes only when the tab and hero are visible', () => {
  const reduced = heroHarness(true);
  reduced.visible(true);
  assert.equal(reduced.plays, 0); assert.equal(reduced.video.src, '');
  reduced.motion.matches = false;
  reduced.motion.dispatchEvent(new Event('change'));
  assert.equal(reduced.plays, 1);
  const reducedPauses = reduced.pauses;
  reduced.motion.matches = true;
  reduced.motion.dispatchEvent(new Event('change'));
  assert.equal(reduced.pauses, reducedPauses + 1);
  reduced.cleanup();
  const hero = heroHarness();
  hero.visible(true);
  hero.document.hidden = true;
  hero.document.dispatchEvent(new Event('visibilitychange'));
  assert.ok(hero.pauses > 0);
  hero.document.hidden = false;
  hero.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(hero.plays, 2);
  hero.visible(false);
  hero.document.hidden = true;
  hero.document.dispatchEvent(new Event('visibilitychange'));
  hero.document.hidden = false;
  hero.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(hero.plays, 2);
  hero.cleanup();
});

test('form validation clears errors on change without capturing the select input event', () => {
  let errors = {};
  class Input {}
  class Select {}
  class Textarea {}
  const react = { useState: () => [errors, update => { errors = update(errors); }] };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/form-accessibility.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const compiled = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${source}\n})`, {
    HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: Textarea,
  })(name => name === 'react' ? react : nativeRequire(name), compiled, compiled.exports);
  const render = () => compiled.exports.useFormAccessibility();
  const select = Object.assign(new Select(), { id: 'key', validity: { valid: false }, validationMessage: '選択してください' });
  const email = Object.assign(new Input(), { id: 'email', validity: { valid: false }, validationMessage: 'メールを入力してください' });
  render().onInvalidCapture({ target: select });
  render().onInvalidCapture({ target: email });
  assert.equal(render().field('key')['aria-invalid'], true);
  assert.equal(render().onInputCapture, undefined);
  render().onChangeCapture({ target: select });
  assert.equal(render().field('key')['aria-invalid'], true);
  select.validity.valid = true;
  render().onChangeCapture({ target: select });
  assert.equal(render().field('key')['aria-invalid'], false);
  assert.equal(render().field('email')['aria-invalid'], true);
  const unchanged = errors;
  render().onChangeCapture({ target: select });
  assert.equal(errors, unchanged);
});

// Compile actual handlers in memory, replacing only external side effects.
test('feedback validates dates, limits and ratings and permits incomplete drafts only before export', () => {
  const load = loader();
  const { emptyFeedback, feedbackExportErrors } = load('src/lib/feedback.ts');
  const { validateFeedback, feedbackVersion } = load('src/lib/feedback-input.ts');
  const draft = emptyFeedback();
  assert.deepEqual(validateFeedback(draft), draft);
  assert.ok(feedbackExportErrors(draft).length > 0);
  assert.throws(() => validateFeedback({ ...draft, date: '2026-02-30' }));
  assert.throws(() => validateFeedback({ ...draft, summary: 'あ'.repeat(1201) }));
  assert.throws(() => validateFeedback({ ...draft, items: { ...draft.items, pitch: { rating: '5', comment: '' } } }));
  assert.throws(() => feedbackVersion(-1));
  draft.summary = '今回の総評'; draft.strengths = 'よかった点';
  for (const item of Object.values(draft.items)) item.rating = '確認対象外';
  assert.match(feedbackExportErrors(draft).join(''), /確認・修正/);
  draft.reviewed = true;
  assert.deepEqual(feedbackExportErrors(draft), []);
  draft.priorities[0].title = '音程を確認';
  assert.match(feedbackExportErrors(draft).join(''), /試し方/);
});

test('feedback API requires admin access, rejects malformed inputs and protects concurrent drafts', async () => {
  let writes = 0;
  const prisma = { order: { findUnique: async () => ({ id: 'test' }) }, orderFeedback: {
    create: async () => { writes++; }, updateMany: async () => { writes++; return { count: 0 }; },
  } };
  const mocks = { '@/lib/prisma': { prisma }, '@/lib/admin-api-auth': { isAdminRequest: async () => false } };
  const file = 'src/app/api/admin/orders/[id]/feedback/route.ts';
  const request = body => new Request('http://localhost/api/admin/orders/test/feedback', { method: 'PUT', body: JSON.stringify(body) });
  const context = { params: Promise.resolve({ id: 'test' }) };
  assert.equal((await loader(mocks)(file).GET(new Request('http://localhost/'), context)).status, 401);
  assert.equal((await loader(mocks)(file).PUT(request({}), context)).status, 401);
  mocks['@/lib/admin-api-auth'] = { isAdminRequest: async () => true };
  const load = loader(mocks), route = load(file), content = load('src/lib/feedback.ts').emptyFeedback();
  assert.equal((await route.PUT(request({ content: {}, version: 0 }), context)).status, 400);
  assert.equal(writes, 0);
  assert.equal((await route.PUT(request({ content, version: 0 }), context)).status, 200);
  assert.equal((await route.PUT(request({ content, version: 1 }), context)).status, 409);
  assert.equal(writes, 2);
});

test('feedback reads old reports and preserves notes without approving old content', () => {
  const load = loader(), { emptyFeedback, feedbackExportErrors } = load('src/lib/feedback.ts');
  const { validateFeedback } = load('src/lib/feedback-input.ts');
  const old = emptyFeedback();
  delete old.memo; delete old.comparison; delete old.reviewed; delete old.aiQuestions;
  old.changes = '前回より改善';
  const parsed = validateFeedback(old);
  assert.equal(parsed.comparison, 'compare'); assert.equal(parsed.reviewed, false);
  const draft = validateFeedback({ ...parsed, memo: '管理用メモ', comparison: 'first', strengths: '', reviewed: true });
  assert.equal(draft.memo, '管理用メモ');
  assert.ok(!feedbackExportErrors(draft).some(error => error.includes('よかったところ')));
  assert.throws(() => validateFeedback({ ...draft, reviewed: 'true' }));
  assert.throws(() => validateFeedback({ ...draft, comparison: 'other' }));
});

test('AI classifies shuffled notes with evidence and drops unsupported observations', () => {
  const { parseFeedbackAiDraft } = loader()('src/lib/feedback-ai.ts');
  const output = {
    summary: 'ノイズと音程を確認しましょう。', strengths: '語尾がきれいです。', closing: '', changes: '勝手な前回比較', questions: ['歌唱が微妙の具体的な箇所を確認してください。'],
    items: [
      { key: 'words', rating: '良好', comment: '語尾が明瞭です。', sourceQuotes: ['語尾きれい'] },
      { key: 'pitch', rating: '少し気になる', comment: 'サビ入りが低めです。', sourceQuotes: ['サビ入り低い'] },
      { key: 'noise', rating: '少し気になる', comment: 'ノイズが目立ちます。', sourceQuotes: ['ノイズ目立つ'] },
      { key: 'room', rating: '良好', comment: '響きはありません。', sourceQuotes: ['存在しない根拠'] },
    ],
    priorities: [{ title: 'サビ入りを確認', observation: 'サビ入りが低めです。', action: 'ガイド音を確認してみてください。', sourceQuote: 'サビ入り低い' }],
  };
  const result = parseFeedbackAiDraft(output, '・語尾きれい\n・ノイズ目立つ\n・歌唱が微妙\n・サビ入り低い', 'first', '2026-10-27');
  assert.equal(result.content.items.noise.rating, '少し気になる');
  assert.equal(result.content.items.room.rating, '確認対象外');
  assert.equal(result.content.items.rhythm.rating, '確認対象外');
  assert.equal(result.content.changes, ''); assert.equal(result.content.reviewed, false);
  assert.equal(result.content.priorities.length, 3);
  assert.deepEqual(result.evidence.words, ['語尾きれい']);
  assert.ok(result.questions.length >= 2);
});

test('OpenAI generation uses strict JSON, no storage and does not fall back to Gemini', async () => {
  const original = process.env.OPENAI_API_KEY;
  try {
    delete process.env.OPENAI_API_KEY;
    await assert.rejects(loader()('src/lib/feedback-ai.ts').generateFeedbackDraft('ノイズ', 'first', '2026-10-27', ''), /APIキー/);
    process.env.OPENAI_API_KEY = 'test-not-a-real-key';
    let sent;
    const load = loader({ fetch: async (url, init) => {
      sent = { url, body: JSON.parse(init.body) };
      return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ summary: 'ノイズが目立ちます。', strengths: '', closing: '', changes: '', questions: [], items: [{ key: 'noise', rating: '少し気になる', comment: 'ノイズが目立ちます。', sourceQuotes: ['ノイズ'] }], priorities: [] }) }] }] });
    } });
    const result = await load('src/lib/feedback-ai.ts').generateFeedbackDraft('ノイズ', 'first', '2026-10-27', '前回の秘密メモ');
    assert.equal(sent.url, 'https://api.openai.com/v1/responses');
    assert.equal(sent.body.store, false); assert.equal(sent.body.text.format.strict, true);
    assert.ok(!sent.body.input.includes('前回の秘密メモ'));
    assert.equal(result.content.reviewed, false);
    const failure = loader({ fetch: async () => Response.json({ error: 'provider details' }, { status: 429 }) });
    await assert.rejects(failure('src/lib/feedback-ai.ts').generateFeedbackDraft('ノイズ', 'first', '2026-10-27', ''), /上限/);
  } finally { if (original === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = original; }
});

test('AI draft API authenticates first and removes client identity from the OpenAI payload', async () => {
  const file = 'src/app/api/admin/orders/[id]/feedback/draft/route.ts', context = { params: Promise.resolve({ id: 'private-order-id' }) };
  const request = body => new Request('https://example.test/api/admin/orders/private-order-id/feedback/draft', { method: 'POST', body: JSON.stringify(body) });
  let received;
  const mocks = {
    '@/lib/admin-api-auth': { isAdminRequest: async () => false },
    '@/lib/prisma': { prisma: { order: { findUnique: async () => ({ clientName: '顧客テスト' }) } } },
    '@/lib/rate-limit': { consumeRateLimit: async () => {} },
    '@/lib/feedback-history': { previousFeedbackText: async () => '過去の本文' },
    '@/lib/feedback-ai': { generateFeedbackDraft: async (...args) => { received = args; return { content: {}, questions: [], evidence: {} }; } },
  };
  assert.equal((await loader(mocks)(file).POST(request({}), context)).status, 401);
  mocks['@/lib/admin-api-auth'].isAdminRequest = async () => true;
  const original = process.env.OPENAI_API_KEY;
  try {
    process.env.OPENAI_API_KEY = 'test-not-a-real-key';
    const body = { memo: '顧客テスト ノイズ user@example.test https://example.test/private', comparison: 'first', date: '2026-10-27' };
    const result = await loader(mocks)(file).POST(request(body), context);
    assert.equal(result.status, 200);
    assert.ok(!received[0].includes('顧客テスト')); assert.ok(!received[0].includes('user@example.test')); assert.ok(!received[0].includes('https://example.test/private'));
    assert.equal(received[3], ''); assert.equal((await result.json()).draft.content.memo, body.memo);
    assert.equal((await loader(mocks)(file).POST(request({ ...body, date: '2026-02-30' }), context)).status, 400);
  } finally { if (original === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = original; }
});

function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (cache.has(file)) return cache.get(file).exports;
    const source = fs.readFileSync(file, 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } }).outputText;
    const compiledModule = { exports: {} }; cache.set(file, compiledModule);
    const requireMock = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name === '@/lib/mail') return { sendMail: async () => ({ success: true }) };
      if (name === 'next/server') return { NextResponse: Response, after() {} };
      if (name === 'next/cache') return { revalidatePath() {}, revalidateTag() {}, unstable_cache: fn => fn };
      if (name.startsWith('@/')) {
        const base = 'src/' + name.slice(2);
        return load(fs.existsSync(path.join(root, base + '.ts')) ? base + '.ts' : base + '.tsx');
      }
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
      return nativeRequire(name);
    };
    vm.runInThisContext('(function(require,module,exports,fetch){' + output + '\n})', { filename: file })(requireMock, compiledModule, compiledModule.exports, mocks.fetch || (async () => Response.json({})));
    return compiledModule.exports;
  }
  return load;
}

test('admin revenue modes include ongoing bookings and archived revenue, excluding canceled and reopened deliveries', () => {
  const { revenueDate } = loader()('src/lib/admin-finance.ts');
  const order = { status: 'WORKING', createdAt: '2026-10-01T00:00:00Z', deliveredAt: null, isArchived: true };
  assert.equal(revenueDate(order, 'created'), order.createdAt);
  assert.equal(revenueDate(order, 'delivered'), null);
  const completed = { ...order, status: 'COMPLETED', deliveredAt: '2026-10-10T00:00:00Z' };
  assert.equal(revenueDate(completed, 'delivered'), completed.deliveredAt);
  for (const status of ['CANCELED', 'CANCELLED']) {
    assert.equal(revenueDate({ ...completed, status }, 'created'), null);
    assert.equal(revenueDate({ ...completed, status }, 'delivered'), null);
  }
  assert.equal(revenueDate({ ...completed, status: 'WORKING' }, 'delivered'), null);
});

test('admin accounting uses Japan time at month/year boundaries and exclusive monthly ends', () => {
  const { accountingDate, accountingParts } = loader()('src/lib/admin-finance.ts');
  assert.equal(accountingDate(2027, 0).toISOString(), '2026-12-31T15:00:00.000Z');
  assert.equal(accountingParts('2026-12-31T15:00:00Z').year, 2027);
  assert.equal(accountingParts('2026-12-31T14:59:59.999Z').year, 2026);
  assert.equal(accountingParts(accountingDate(2026, -1)).month, 11);
});

test('shared order statuses preserve waiting/canceled states and normalize legacy cancellation', () => {
  const { ORDER_STATUS_OPTIONS, normalizeOrderStatus, ORDER_STATUS_LABELS } = loader()('src/lib/order-status.ts');
  const values = ORDER_STATUS_OPTIONS.map(option => option.value);
  assert.equal(values.length, 6);
  for (const value of ['WAITING_PAYMENT', 'CANCELED', 'PENDING']) assert.ok(values.includes(normalizeOrderStatus(value)));
  assert.equal(normalizeOrderStatus('CANCELLED'), 'CANCELED');
  assert.equal(ORDER_STATUS_LABELS.PENDING, '未対応');
});

test('payment editing retains public Japanese values and normalizes old identifiers without changing unrelated data', () => {
  const { normalizePaymentMethod, ADMIN_PAYMENT_OPTIONS, PAYMENT_METHODS } = loader()('src/lib/order-payment.ts');
  for (const value of PAYMENT_METHODS) {
    assert.equal(normalizePaymentMethod(value), value);
    assert.ok(ADMIN_PAYMENT_OPTIONS.some(option => option.value === value));
  }
  assert.equal(normalizePaymentMethod('bank_transfer'), '銀行振込');
  assert.equal(normalizePaymentMethod('credit_card'), 'クレジットカード');
  assert.equal(normalizePaymentMethod('paypay'), 'PayPay');
  assert.equal(normalizePaymentMethod('旧独自表記'), '旧独自表記');
});

test('admin order validation rejects invalid types, enums, dates and money without accepting unknown fields', () => {
  const { validateAdminOrderUpdate, reconcileAdminOrderPrice } = loader()('src/lib/admin-order-input.ts');
  for (const body of [{status:'INVALID'}, {status:null}, {price:-1}, {price:1.5}, {price:'100'}, {price:2147483648}, {isArchived:'true'}, {serviceType:'OTHER'}, {deadline:'2026-02-30'}, {deadline:'tomorrow'}, {clientEmail:'invalid'}, {clientName:''}, {paymentMethod:'unknown'}, {id:'overwritten'}, {}]) {
    assert.throws(() => validateAdminOrderUpdate(body), { status:400 });
  }
  const current = {basePrice:10000, optionPrice:2000};
  const update = validateAdminOrderUpdate({basePrice:0, status:'CANCELLED', paymentMethod:'bank_transfer'});
  reconcileAdminOrderPrice(update,current);
  assert.equal(update.price,2000); assert.equal(update.status,'CANCELED'); assert.equal(update.paymentMethod,'銀行振込');
  assert.throws(() => reconcileAdminOrderPrice({price:1},current),{status:400});
  assert.throws(() => reconcileAdminOrderPrice({price:12000,basePrice:20000},current),{status:400});
  const zero = {basePrice:0,optionPrice:0}; reconcileAdminOrderPrice(zero,current); assert.equal(zero.price,0);
});

test('admin PATCH rejects malformed or invalid input before writes and detects concurrent updates', async () => {
  let writes=0, conflict=false, authorized=true;
  let order={id:'qa',status:'WORKING',basePrice:10000,optionPrice:2000,price:12000,createdAt:new Date(),updatedAt:new Date(),deliveredAt:null};
  const mock={order:{findUnique:async()=>order,updateMany:async({data})=>{writes++; if(conflict)return{count:0};order={...order,...data};return{count:1};}}};
  const {PATCH}=loader({'@/lib/prisma':{prisma:mock},'@/lib/admin-api-auth':{isAdminRequest:async()=>authorized}})('src/app/api/admin/orders/[id]/route.ts');
  const params={params:Promise.resolve({id:'qa'})};
  assert.equal((await PATCH(new Request('http://localhost',{method:'PATCH',body:'{'}),params)).status,400);
  for(const body of [{status:'INVALID'},{price:-10},{price:5},{deadline:'2026-13-01'}])assert.equal((await PATCH(request(body),params)).status,400);
  assert.equal(writes,0);
  assert.equal((await PATCH(request({optionPrice:3000}),params)).status,200); assert.equal(order.price,13000);
  assert.equal((await PATCH(request({status:'COMPLETED'}),params)).status,200); assert.ok(order.deliveredAt);
  conflict=true;assert.equal((await PATCH(request({status:'WORKING'}),params)).status,409);
  const count=writes;authorized=false;assert.equal((await PATCH(request({status:'PENDING'}),params)).status,401);assert.equal(writes,count);
});

test('admin client rejects lossy money parsing and reports API/network/calendar failures', async () => {
  const load = loader(); const {parseAdminMoney}=load('src/lib/admin-order-client.ts');
  for (const value of ['-100','1.5','1e3','1,000','a100']) assert.throws(()=>parseAdminMoney(value));
  assert.equal(parseAdminMoney('0'),0); assert.equal(parseAdminMoney(''),null);
  for (const response of [Response.json({error:'内訳を確認してください'},{status:400}),new Response('bad',{status:500}),Response.json({success:true,order:{id:'other'}})]) {
    const {patchAdminOrder}=loader({fetch:async()=>response})('src/lib/admin-order-client.ts');
    await assert.rejects(()=>patchAdminOrder('qa',{price:0}));
  }
  const network=loader({fetch:async()=>{throw Error('offline');}})('src/lib/admin-order-client.ts');
  await assert.rejects(()=>network.patchAdminOrder('qa',{}),/入力内容は保持/);
  const calendar=loader({fetch:async()=>Response.json({success:false},{status:503})})('src/lib/admin-order-client.ts');
  await assert.rejects(()=>calendar.syncAdminDeadline('qa','2026-10-31'),/納期は保存しましたが/);
});

test('integration status reports missing/partial config, never implies connectivity or leaks credentials', () => {
  const {adminIntegrationStatuses}=loader()('src/lib/admin-integrations.ts');
  assert.ok(adminIntegrationStatuses({}).every(status=>status.state==='missing'));
  assert.equal(adminIntegrationStatuses({SMTP_USER:'qa'})[2].state,'incomplete');
  const statuses=adminIntegrationStatuses({SMTP_USER:'qa@example.invalid',SMTP_PASS:'must-not-leak',DISCORD_WEBHOOK_URL:'https://example.invalid/not-discord'});
  assert.equal(statuses[2].state,'configured');assert.match(statuses[2].label,/接続未確認/);
  assert.equal(statuses[1].state,'incomplete');assert.ok(!JSON.stringify(statuses).includes('must-not-leak'));
  assert.equal(adminIntegrationStatuses({SMTP_HOST:'relay',SMTP_FROM:'from@example.invalid'})[2].state,'incomplete');
});

test('publication validation keeps drafts private and blocks incomplete plans, placeholders and invalid prices', () => {
  const {validatePlanContent,validateOptionContent}=loader()('src/lib/admin-plan-input.ts');
  const draft={name:'QAプラン',category:'MIX',price:0};
  assert.equal(validatePlanContent(draft).isActive,false);
  assert.throws(()=>validatePlanContent({...draft,isActive:true}),/説明文/);
  const valid={...draft,description:'説明',period:'7日',revisions:'5回',isActive:true};
  assert.equal(validatePlanContent(valid).price,0);
  for (const price of [-1,1.5,'1e3','bad'])assert.throws(()=>validatePlanContent({...valid,price}));
  assert.throws(()=>validatePlanContent({...valid,name:'新規プラン'}));
  assert.throws(()=>validateOptionContent({name:'QA',category:'MIX',isActive:true,priceText:'2000円'}),/説明文/);
  assert.equal(validateOptionContent({name:'QA',category:'COMMON'}).isActive,false);
});

test('plan and option server actions persist drafts privately and only publish complete confirmed content', async () => {
  const plans=[],options=[];
  const collection=rows=>({findFirst:async()=>null,create:async({data})=>{const row={...data,id:'qa-'+rows.length};rows.push(row);return row;},update:async({where,data})=>{const index=rows.findIndex(row=>row.id===where.id);rows[index]={...rows[index],...data};return rows[index];}});
  const actions=loader({'@/lib/auth':{requireAdmin:async()=>{}},'@/lib/prisma':{prisma:{plan:collection(plans),option:collection(options)}}})('src/app/actions/plans.ts');
  const result=await actions.createPlan({name:'QAプラン',category:'MIX',price:0});
  assert.equal(result.success,true);assert.equal(plans[0].isActive,false);
  const invalid=await actions.updatePlan(result.data.id,{...plans[0],isActive:true});
  assert.equal(invalid.success,false);assert.equal(plans[0].isActive,false);
  const publish=await actions.updatePlan(result.data.id,{...plans[0],description:'説明',period:'7日',revisions:'5回',isActive:true});
  assert.equal(publish.success,true);assert.equal(plans[0].isActive,true);assert.equal(plans[0].price,0);
  const option=await actions.createOption({name:'QAオプション',category:'MIX',priceText:'要相談'});
  assert.equal(option.success,true);assert.equal(options[0].isActive,false);
});

test('adding or editing a plan makes no write until explicit save, and failed saves retain the editor', async () => {
  let writes=0;const errors=[];
  const client=clientHarness('src/components/admin/PlansOptionsClient.tsx','default',{initialPlans:[],initialOptions:[]},{
    '@dnd-kit/core':{useSensor(){},useSensors:()=>[]},
    'react-hot-toast':{error:message=>errors.push(message),success(){}},
    '@/app/actions/plans':{createPlan:async()=>{writes++;return{success:false,error:'保存失敗'};}},
  });
  client.render().find(n=>n.props.onClick&&n.props.children==='＋ プラン追加').props.onClick();
  assert.equal(writes,0);
  const input=client.render().find(n=>n.type==='input'&&n.props.id==='plansoptionsclient-field-2');
  input.props.onChange({target:{value:'QA入力'}});assert.equal(writes,0);
  const draft=client.render().find(n=>n.props.onClick&&n.props.children==='下書き保存');
  draft.props.onClick();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(writes,1);assert.equal(errors.length,1);
  assert.equal(client.render().find(n=>n.type==='input'&&n.props.id==='plansoptionsclient-field-2').props.value,'QA入力');
  client.render().find(n=>n.props['aria-label']==='編集を閉じる').props.onClick();
  assert.equal(client.render().filter(n=>n.type==='input'&&n.props.id==='plansoptionsclient-field-2').length,0);
  assert.equal(writes,1);
});

test('plan arrow actions reorder only the visible category using the existing persistence queue', async () => {
  const tasks=[],saved=[];
  const plans=[{id:'a',name:'A',category:'MIX',orderIndex:0},{id:'b',name:'B',category:'MIX',orderIndex:1},{id:'c',name:'C',category:'ORIGINAL',orderIndex:0}];
  const client=clientHarness('src/components/admin/PlansOptionsClient.tsx','default',{initialPlans:plans,initialOptions:[]},{
    '@dnd-kit/core':{useSensor(){},useSensors:()=>[]},
    '@/lib/save-queue':{SaveQueue:class{enqueue(key,task){tasks.push(task);}flush(){}}},
    '@/app/actions/plans':{updatePlanOrders:async values=>{saved.push(values);return{success:true};}},
  });
  const row=client.render().find(n=>n.props.p?.id==='a');assert.equal(row.props.canMoveUp,false);assert.equal(row.props.canMoveDown,true);
  row.props.onMove(1);await tasks[0]();
  assert.deepEqual(Array.from(saved[0],row=>row.id),['b','a']);
  const next=client.render().filter(n=>n.props.p).map(n=>n.props.p.id);assert.deepEqual(next,['b','a']);
});

function clientHarness(file, name, props, mocks = {}) {
  const values=[];let cursor=0;
  const react={...nativeRequire('react'),useState(initial){const index=cursor++;if(!(index in values))values[index]=typeof initial==='function'?initial():initial;return[values[index],value=>{values[index]=typeof value==='function'?value(values[index]):value;}];},useRef(initial){return this.useState(()=>({current:initial}))[0];},useEffect(){},useMemo:fn=>fn()};
  // Hooks are invoked as functions by compiled modules, without a receiver.
  react.useRef=initial=>react.useState(()=>({current:initial}))[0];
  const component=loader({react,'next/navigation':{useRouter:()=>({push(){},refresh(){}})},...mocks})(file)[name];
  function render(){cursor=0;const tree=component(props);const nodes=[];function walk(node){if(Array.isArray(node)){node.forEach(walk);return;}if(!node||typeof node!=='object')return;if(node.props){nodes.push(node);walk(node.props.children);}}walk(tree);return nodes;}
  return {render};
}

test('archived orders include all statuses and restore only after a successful save', async () => {
  const errors=[]; let fail=true;
  const order={id:'archived',status:'COMPLETED',serviceType:'MIX',clientName:'QA',clientEmail:'qa@example.invalid',createdAt:new Date(),price:0,deadline:null,isArchived:true};
  const client=clientHarness('src/components/admin/OrderListClient.tsx','OrderListClient',{initialOrders:[order],archived:true},{
    'react-hot-toast':{toast:{success(){},error:message=>errors.push(message)}},
    '@/lib/admin-order-client':{patchAdminOrder:async(id,body)=>{assert.equal(id,order.id);assert.equal(body.isArchived,false);if(fail)throw Error('offline');return {...order,...body};}},
  });
  const restore=()=>client.render().find(n=>n.props['aria-label']==='依頼を復元');
  assert.ok(restore());
  await restore().props.onClick({stopPropagation(){}}); await new Promise(resolve=>setImmediate(resolve));
  assert.ok(restore());assert.equal(errors.length,1);
  fail=false;await restore().props.onClick({stopPropagation(){}});await new Promise(resolve=>setImmediate(resolve));
  assert.equal(restore(),undefined);
});

test('archive undo restores the saved record without deleting it', async () => {
  const previousWindow=global.window,calls=[];
  global.window={confirm:()=>true};
  try {
    const order={id:'undo',status:'CANCELED',serviceType:'MIX',clientName:'QA',clientEmail:'qa@example.invalid',createdAt:new Date(),price:0,deadline:null,isArchived:false};
    const client=clientHarness('src/components/admin/OrderListClient.tsx','OrderListClient',{initialOrders:[order],initialFilters:{status:'CANCELED',due:'ALL',service:'ALL',q:'',sort:'desc'}},{
      'react-hot-toast':{toast:{success(){},error:message=>assert.fail(message)}},
      '@/lib/admin-order-client':{patchAdminOrder:async(id,body)=>{assert.equal(id,'undo');calls.push(body.isArchived);return{...order,...body};}},
    });
    client.render().find(n=>n.props['aria-label']==='依頼をアーカイブ').props.onClick({stopPropagation(){}});
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(client.render().find(n=>n.props['aria-label']==='依頼をアーカイブ'),undefined);
    client.render().find(n=>n.type==='button'&&n.props.children==='アーカイブを取り消す').props.onClick();
    await new Promise(resolve=>setImmediate(resolve));
    assert.ok(client.render().find(n=>n.props['aria-label']==='依頼をアーカイブ'));assert.deepEqual(calls,[true,false]);
  } finally { if(previousWindow===undefined)delete global.window;else global.window=previousWindow; }
});

test('order list keeps edited input on save failure, saves once, and supports explicit cancellation', async () => {
  let calls=0,release;const errors=[];
  const order={id:'qa',status:'WORKING',serviceType:'MIX',clientName:'QA',clientEmail:'qa@example.invalid',createdAt:new Date(),updatedAt:new Date(),price:0,deadline:null};
  const client=clientHarness('src/components/admin/OrderListClient.tsx','OrderListClient',{initialOrders:[order]}, {
    'react-hot-toast':{toast:{success(){},error:message=>errors.push(message)}},
    '@/lib/admin-order-client':{parseAdminMoney:value=>Number(value),syncAdminDeadline:async()=>'',patchAdminOrder:async()=>{calls++;await new Promise(resolve=>{release=resolve;});throw Error('保存に失敗しました');}},
  });
  const event={stopPropagation(){},preventDefault(){}};
  client.render().filter(n=>n.props['aria-label']==='納期・金額を編集')[1].props.onClick(event);
  let input=client.render().find(n=>n.type==='input'&&n.props['aria-label']==='合計金額');
  assert.equal(input.props.value,'0');assert.equal(input.props.onBlur,undefined);
  input.props.onChange({target:{value:'123'}});
  let button=client.render().find(n=>n.type==='button'&&n.props.children==='保存');
  button.props.onClick();button.props.onClick();assert.equal(calls,1);release();
  await new Promise(resolve=>setImmediate(resolve));
  input=client.render().find(n=>n.type==='input'&&n.props['aria-label']==='合計金額');
  assert.equal(input.props.value,'123');assert.equal(errors.length,1);
  input.props.onKeyDown({...event,key:'Escape'});
  assert.equal(client.render().filter(n=>n.type==='input'&&n.props['aria-label']==='合計金額').length,0);
});
const request = body => new Request('http://localhost/api/test', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: new URL(process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sien-official.com').origin }, body: JSON.stringify(body),
});

test('customer repeater updates persist both directions across email matches, never grouping empty addresses', async () => {
  const rows=[{id:'a',clientEmail:'qa@example.invalid',isRepeater:false},{id:'b',clientEmail:'QA@example.invalid',isRepeater:false,isArchived:true},{id:'c',clientEmail:'other@example.invalid',isRepeater:false},{id:'empty',clientEmail:'',isRepeater:false},{id:'empty2',clientEmail:'',isRepeater:false}];
  const db={order:{findUnique:async({where})=>rows.find(row=>row.id===where.id),findMany:async({where})=>rows.filter(row=>where.id?row.id===where.id:row.clientEmail.toLowerCase()===where.clientEmail.equals.toLowerCase()),updateMany:async({where,data})=>{rows.filter(row=>where.id.in.includes(row.id)).forEach(row=>Object.assign(row,data));}}};
  db.$transaction=async fn=>fn(db);
  const route=loader({'@/lib/prisma':{prisma:db},'@/lib/admin-api-auth':{isAdminRequest:async()=>true}})('src/app/api/admin/orders/[id]/repeater/route.ts');
  for(const value of [true,false]) {
    const response=await route.PATCH(request({isRepeater:value}),{params:Promise.resolve({id:'a'})});
    assert.equal(response.status,200);assert.deepEqual((await response.json()).ids,['a','b']);
    assert.equal(rows[0].isRepeater,value);assert.equal(rows[1].isRepeater,value);assert.equal(rows[2].isRepeater,false);
  }
  await route.PATCH(request({isRepeater:true}),{params:Promise.resolve({id:'empty'})});
  assert.equal(rows[3].isRepeater,true);assert.equal(rows[4].isRepeater,false);
  assert.equal((await route.PATCH(request({isRepeater:'true'}),{params:Promise.resolve({id:'a'})})).status,400);
  assert.equal((await route.PATCH(request({isRepeater:true}),{params:Promise.resolve({id:'missing'})})).status,404);
  const denied=loader({'@/lib/admin-api-auth':{isAdminRequest:async()=>false}})('src/app/api/admin/orders/[id]/repeater/route.ts');
  assert.equal((await denied.PATCH(request({isRepeater:true}),{params:Promise.resolve({id:'a'})})).status,401);
});

test('dashboard deadline filters share strict dates and Japan-time boundaries with the order list', () => {
  const {confirmedDeadline,todayInJapan,matchesOrderDue,compareOrderDeadlines,parseOrderFilters,orderFilterUrl,matchesOrderStatus}=loader()('src/lib/admin-order-filters.ts');
  assert.equal(todayInJapan(new Date('2026-12-31T15:00:00Z')),'2027-01-01');
  for(const value of ['1/1','2026-02-30','2026-01-01ごろ','未定'])assert.equal(confirmedDeadline(value),null);
  assert.equal(confirmedDeadline('2026年1月2日'),'2026-01-02');assert.equal(confirmedDeadline('2028/2/29'),'2028-02-29');
  assert.equal(matchesOrderDue({status:'WAITING_PAYMENT',deadline:'2026-10-01'},'overdue','2026-10-11'),true);
  assert.equal(matchesOrderDue({status:'COMPLETED',deadline:'2026-10-01'},'overdue','2026-10-11'),false);
  assert.equal(matchesOrderDue({status:'WORKING',deadline:'10/1'},'overdue','2026-10-11'),false);
  assert.equal(matchesOrderDue({status:'WORKING',deadline:'2026-10-11'},'today','2026-10-11'),true);
  assert.ok(compareOrderDeadlines({deadline:'2026-10-01',createdAt:new Date()},{deadline:null,createdAt:new Date()})<0);
  assert.equal(matchesOrderStatus('CANCELLED','CANCELED'),true);
  const filters=parseOrderFilters({status:'WAITING_PAYMENT',due:'overdue',service:'MIX',q:'QA',sort:'deadline'});
  assert.equal(orderFilterUrl(filters,true),'/admin/orders?archive=1&status=WAITING_PAYMENT&due=overdue&service=MIX&q=QA&sort=deadline');
  assert.equal(parseOrderFilters({status:'INVALID',due:'INVALID'}).status,'ALL');
});

test('notification filters retain page parameters and reject invalid date ranges', () => {
  const {notificationFilters,notificationPageUrl,canRetryNotification}=loader()('src/lib/admin-notifications.ts');
  const filters=notificationFilters({status:'failed',kind:'ORDER_RECEIPT_EMAIL',from:'2026-10-01',to:'2026-10-11',q:'QA-001',page:'2'});
  assert.deepEqual(filters.where.status.in,['FAILED','EXHAUSTED']);assert.equal(filters.where.createdAt.gte.toISOString(),'2026-09-30T15:00:00.000Z');assert.equal(filters.where.createdAt.lt.toISOString(),'2026-10-11T15:00:00.000Z');
  assert.match(notificationPageUrl(filters,3),/q=QA-001&page=3/);
  assert.deepEqual(notificationFilters({status:'failed'}).where.kind.notIn,['ORDER_RECEIPT_EMAIL','BUSINESS_RECEIPT_EMAIL']);
  assert.equal(filters.where.kind,'ORDER_RECEIPT_EMAIL');
  assert.ok(notificationFilters({from:'2026-02-30'}).error);assert.ok(notificationFilters({from:'2026/1/1'}).error);assert.ok(notificationFilters({from:'2026-10-11',to:'2026-10-01'}).error);
  for(const status of ['PENDING','PROCESSING','DELIVERED'])assert.equal(canRetryNotification({status,lockedUntil:null}),false);
  assert.equal(canRetryNotification({status:'EXHAUSTED',lockedUntil:new Date(Date.now()+10000)}),false);
});

test('manual notification retry targets one failed job and refuses delivered, processing and concurrent updates', async () => {
  let job={id:'job',status:'FAILED',lockedUntil:null,updatedAt:new Date()},claimed=1,calls=0;
  const db={notificationJob:{findUnique:async()=>job,updateMany:async({where,data})=>{assert.equal(where.id,'job');assert.equal(where.updatedAt,job.updatedAt);if(claimed)job={...job,...data};return{count:claimed};}}};
  const route=loader({'@/lib/prisma':{prisma:db},'@/lib/admin-api-auth':{isAdminRequest:async()=>true},'@/lib/notifications':{processPendingNotifications:async(limit,budget,id)=>{calls++;assert.equal(limit,1);assert.equal(id,'job');job.status='DELIVERED';}}})('src/app/api/admin/notifications/[id]/retry/route.ts');
  const params={params:Promise.resolve({id:'job'})};
  assert.equal((await route.POST(request({}),params)).status,200);assert.equal(calls,1);
  for(const status of ['DELIVERED','PROCESSING','PENDING']){job.status=status;assert.equal((await route.POST(request({}),params)).status,409);}
  job.status='EXHAUSTED';claimed=0;assert.equal((await route.POST(request({}),params)).status,409);assert.equal(calls,1);
  const denied=loader({'@/lib/admin-api-auth':{isAdminRequest:async()=>false}})('src/app/api/admin/notifications/[id]/retry/route.ts');
  assert.equal((await denied.POST(request({}),params)).status,401);
});

test('autosave retains independent records, keeps latest edits and serializes writes', async () => {
  const { SaveQueue } = loader()('src/lib/save-queue.ts');
  const values = [], errors = [];
  let running = 0, maximum = 0;
  const queue = new SaveQueue(error => errors.push(error), 1000);
  const save = value => async () => {
    running++; maximum = Math.max(maximum, running);
    await Promise.resolve(); values.push(value); running--;
  };
  queue.enqueue('A', save('old'));
  queue.enqueue('B', save('B'));
  queue.enqueue('A', save('latest'));
  queue.enqueue('failed', async () => { throw Error('offline'); });
  queue.enqueue('C', save('C'));
  await queue.flush();
  assert.deepEqual(values, ['latest', 'B', 'C']);
  assert.equal(maximum, 1);
  assert.equal(errors.length, 1);
});

test('authenticated management writes require the configured site origin', async () => {
  const authorize = loader({ '@/lib/auth': { isAdmin: async () => true } })('src/lib/admin-api-auth.ts').isAdminRequest;
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sien-official.com';
  const origin = new URL(base).origin;
  assert.equal(await authorize(new Request(base, { method: 'POST', headers: { Origin: origin } })), true);
  assert.equal(await authorize(new Request(base, { method: 'POST', headers: { Origin: 'https://attacker.invalid' } })), false);
  assert.equal(await authorize(new Request(base, { method: 'POST' })), false);
  assert.equal(await authorize(new Request(base)), true);
});
const validOrder = { termsAccepted: true, termsVersion: '2026-10-11', contactMethod: 'メール', paymentMethod: '銀行振込', songTitle: 'QA', vocalKey: '±0（原曲キー）', idempotencyKey: 'qa-order-key-12345678', clientName: 'Test', clientEmail: 'test@example.com', serviceType: 'MIX', planId: 'plan-1', optionIds: [] };
const plan = { id: 'plan-1', name: 'スタンダードプラン', category: 'MIX', price: 10000, period: '7日', revisions: '5回' };
test('plan selection preserves the chosen service and handles obsolete IDs and zero prices', () => {
  const { resolveOrderSelection } = loader()('src/lib/order-selection.ts');
  const plans = [plan, { id: 'original', name: '制作', category: 'ORIGINAL', price: 66000 }, { id: 'free', name: '無料', category: 'MIX', price: 0 }];
  assert.deepEqual(resolveOrderSelection(plans, 'original'), { serviceType: 'ORIGINAL', planId: 'original', selectionNotice: '' });
  assert.equal(resolveOrderSelection(plans, 'free').planId, 'free');
  assert.equal(resolveOrderSelection(plans, undefined, 'ORIGINAL').planId, 'original');
  assert.match(resolveOrderSelection(plans, 'retired').selectionNotice, /利用できません/);
});
function orderHarness({ unavailable = false, options = [], missingPlan = false } = {}) {
  const saved = [];
  const db = {
    $transaction: async fn => fn(db),
    $queryRaw: async () => [{ locked: 1 }],
    submissionReceipt: { findUnique: async () => null, create: async ({ data }) => ({ id: 'receipt-1', ...data }) },
    notificationJob: { createMany: async () => ({ count: 2 }) },
    campaign: { findMany: async () => [] },
    siteSetting: { findUnique: async () => ({ orderStatus: unavailable ? 'UNAVAILABLE' : 'AVAILABLE' }) },
    plan: { findFirst: async () => missingPlan ? null : plan },
    option: { findMany: async () => options },
    order: { create: async ({ data }) => { saved.push(data); return { id: 'order-1', ...data }; } },
  };
  const load = loader({
    '@/lib/prisma': { prisma: db }, '@/lib/rate-limit': { consumeRateLimit: async () => {} },
    '@/lib/repeater': { checkIsRepeater: async () => false, updateAllClientOrdersToRepeater: async () => {} },
  });
  return { handler: load('src/app/api/orders/route.ts').POST, saved };
}

test('anonymous requests cannot reach any administrative API or AI operation', async () => {
  function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
  const routes = [...files(path.join(root, 'src/app/api/admin')), path.join(root, 'src/app/api/posts/route.ts')];
  const load = loader({
    '@/lib/auth': { isAdmin: async () => false }, '@/lib/prisma': { prisma: {} },
    '@/lib/rate-limit': { consumeRateLimit: async () => { throw Error('Unexpected rate-limit call'); } },
    'googleapis': {}, '@google/generative-ai': {},
  });
  let checked = 0;
  for (const file of routes.filter(f => f.endsWith('route.ts'))) {
    for (const [method, fn] of Object.entries(load(file))) {
      if (!['GET', 'POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) continue;
      const response = await fn(request({}), { params: Promise.resolve({ id: '1' }) });
      assert.equal(response.status, 401, file + ' ' + method); checked++;
    }
  }
  assert.ok(checked >= 15);
});

test('all exported management mutations reject an unauthenticated caller', async () => {
  const load = loader({ '@/lib/auth': { requireAdmin: async () => { throw Error('Unauthorized'); } }, '@/lib/prisma': { prisma: {} } });
  for (const name of ['cms', 'plans', 'portfolio', 'settings']) {
    for (const [key, fn] of Object.entries(load('src/app/actions/' + name + '.ts'))) {
      if (key === 'getSiteSetting') continue;
      await assert.rejects(() => fn(), /Unauthorized/, key);
    }
  }
});

test('order ignores forged prices and labels, preserving the authoritative price', async () => {
  const { handler, saved } = orderHarness();
  const response = await handler(request({ ...validOrder, price: -999, basePrice: 1, optionPrice: -100, options: '無料', isRepeater: true }));
  assert.equal(response.status, 201);
  assert.equal(saved[0].price, 10000);
  assert.equal(saved[0].basePrice, 10000);
  assert.equal(saved[0].optionPrice, 0);
  assert.equal(saved[0].planId, plan.name);
  assert.equal(saved[0].options, '');
  const result = await response.json();
  assert.equal(result.orderId, 'order-1');
  assert.equal(Object.hasOwn(result, 'receiptNumber'), false);
  assert.equal(Object.hasOwn(result, 'estimate'), false);
});

test('closed reception rejects previously opened forms before saving', async () => {
  const { handler, saved } = orderHarness({ unavailable: true });
  assert.equal((await handler(request(validOrder))).status, 409);
  assert.equal(saved.length, 0);
});

test('invalid, inactive, or wrong-category selections cannot create orders', async () => {
  for (const config of [{ body: { ...validOrder, optionIds: ['unknown'] } }, { body: validOrder, missingPlan: true }, { body: { ...validOrder, optionIds: ['a', 'a'] } }]) {
    const { handler, saved } = orderHarness(config);
    assert.equal((await handler(request(config.body))).status, 400);
    assert.equal(saved.length, 0);
  }
});

test('consultation is not stored as a final price, and options come from DB', async () => {
  const { handler, saved } = orderHarness({ options: [{ id: 'opt', name: '追加作業', priceText: '要相談' }] });
  assert.equal((await handler(request({ ...validOrder, optionIds: ['opt'] }))).status, 201);
  assert.equal(saved[0].price, null);
  assert.equal(saved[0].options, '追加作業 (要相談)');
});

test('encoding threshold and paid options match the existing quotation rule', () => {
  const { calculateOrderPrice } = loader()('src/lib/order-pricing.ts');
  const encode = { name: 'エンコード', priceText: '1,000円' };
  assert.equal(calculateOrderPrice({ price: 8000 }, [encode]).total, 9000);
  assert.equal(calculateOrderPrice({ price: 10000 }, [encode]).total, 10000);
  assert.equal(calculateOrderPrice({ price: 8000 }, [encode, { name: '追加', priceText: '2,000円' }]).total, 10000);
  assert.equal(calculateOrderPrice({ price: null }, []).hasConsultation, true);
});

test('human vocal guide has one authoritative selection and adds its quoted fee', () => {
  const load = loader();
  const { vocalGuideFromOptions } = load('src/lib/vocal-guide.ts');
  const { calculateOrderPrice } = load('src/lib/order-pricing.ts');
  const guide = { name: '人間による仮歌歌唱', priceText: '5,000円〜' };
  assert.equal(vocalGuideFromOptions('不要', [guide]), '人間による仮歌');
  assert.equal(vocalGuideFromOptions('ボーカロイド仮歌（無料）', []), 'ボーカロイド仮歌（無料）');
  assert.deepEqual(calculateOrderPrice({ price: 66000 }, [guide]), { basePrice: 66000, optionPrice: 5000, total: 71000, hasConsultation: true });
});
test('deadline descriptions distinguish initial draft from final delivery', () => {
  const { initialDraftDescription, DELIVERY_TERMS } = loader()('src/lib/contract-terms.ts');
  assert.equal(initialDraftDescription('1日以内に納品します。'), '1日以内に初稿を提出します。');
  assert.match(DELIVERY_TERMS, /最終納品日.*別途/);
});
test('featured works query accepts both canonical and legacy category values', async () => {
  let query;
  const load = loader({ '@/lib/prisma': { prisma: { portfolio: { findMany: async value => { query = value; return []; } } } } });
  await load('src/lib/data/cms.ts').getFeaturedPortfolios('ORIGINAL', 3);
  assert.deepEqual(query.where.serviceCategory.in, ['ORIGINAL', 'オリジナル楽曲制作']);
  const { serviceCategory } = load('src/lib/service-category.ts');
  assert.equal(serviceCategory('ボーカルMIX'), 'MIX');
  assert.equal(serviceCategory('オリジナル楽曲制作'), 'ORIGINAL');
});
test('campaign pricing applies only within its valid period and target plan', () => {
  const { currentPlanCampaign } = loader()('src/lib/campaign-pricing.ts');
  const now = new Date('2026-10-01T00:00:00Z');
  const current = { id: 'sale', name: 'Sale', targetPlanId: 'plan-1', campaignPrice: 8000, isActive: true, startDate: new Date('2026-09-01'), endDate: new Date('2026-10-05') };
  assert.equal(currentPlanCampaign('plan-1', [current], now).campaignPrice, 8000);
  assert.equal(currentPlanCampaign('another', [current], now), undefined);
  assert.equal(currentPlanCampaign('plan-1', [{ ...current, endDate: new Date('2026-07-17') }], now), undefined);
  assert.equal(currentPlanCampaign('plan-1', [{ ...current, isActive: false }], now), undefined);
});
test('public settings never pass financial settings or unsafe URLs to the client', async () => {
  const load = loader({ '@/lib/data/cms': { getSiteSettings: async () => ({ targetMonthlySales: 999, twitterUrl: 'javascript:alert(1)', youtubeUrl: 'https://www.youtube.com/@sien_mc09', footerText: '<script>text only</script>' }) } });
  const settings = await load('src/lib/data/public-settings.ts').getPublicSettings();
  assert.equal(settings.targetMonthlySales, undefined);
  assert.match(settings.twitterUrl, /^https:/);
  assert.equal(settings.footerText, '<script>text only</script>');
});
test('rate limit identity ignores untrusted IP headers and respects explicit proxy configuration', () => {
  const original = process.env.TRUSTED_CLIENT_IP_HEADER;
  const { requestIdentity } = loader()('src/lib/request-identity.ts');
  try {
    delete process.env.TRUSTED_CLIENT_IP_HEADER;
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.10' });
    assert.equal(requestIdentity(headers, 'TEST@example.com'), 'fallback:test@example.com');
    process.env.TRUSTED_CLIENT_IP_HEADER = 'x-forwarded-for';
    assert.equal(requestIdentity(headers, 'TEST@example.com'), 'ip:203.0.113.10');
    assert.equal(requestIdentity(new Headers({ 'x-forwarded-for': 'invalid' }), 'mail'), 'fallback:mail');
  } finally { if (original === undefined) delete process.env.TRUSTED_CLIENT_IP_HEADER; else process.env.TRUSTED_CLIENT_IP_HEADER = original; }
});
test('rate limit responses include retry timing', () => {
  const { ApiError, apiErrorResponse } = loader()('src/lib/api-input.ts');
  assert.equal(apiErrorResponse(new ApiError(429, 'limit', 60)).headers.get('Retry-After'), '60');
});

test('input parser rejects malformed and oversized JSON, arrays, and email lists', async () => {
  const { readJson, emailField } = loader()('src/lib/api-input.ts');
  await assert.rejects(() => readJson(new Request('http://localhost', { method: 'POST', body: '{' })), { status: 400 });
  await assert.rejects(() => readJson(request([])), { status: 400 });
  await assert.rejects(() => readJson(request({ message: 'x'.repeat(25000) })), { status: 413 });
  assert.throws(() => emailField({ email: 'a@example.com,b@example.com' }, 'email'), { status: 400 });
});

test('corporate contact limits run before database saves and email sends', async () => {
  let calls = 0;
  const load = loader({ '@/lib/prisma': { prisma: { submissionReceipt: { findUnique: async () => null }, businessContact: { create() { calls++; } } } },
    '@/lib/rate-limit': { consumeRateLimit: async () => { throw new (load('src/lib/api-input.ts').ApiError)(429, 'limit'); } },
  });
  const response = await load('src/app/api/business-contact/route.ts').POST(request({ idempotencyKey: 'qa-business-key-12345678', termsAccepted: true, termsVersion: '2026-10-11', companyName: 'Test', contactName: 'Test', email: 'test@example.com', inquiryType: '歌ってみたMIX・マスタリング', message: 'Test' }));
  assert.equal(response.status, 429); assert.equal(calls, 0);
});

test('unused admin AI generators and their routes are removed, keeping public chat available', () => {
  for (const file of ['src/components/admin/AiReplyPanel.tsx', 'src/components/admin/AiPostGeneratorPanel.tsx', 'src/app/api/generate-reply/route.ts', 'src/app/api/generate-post/route.ts']) assert.equal(fs.existsSync(path.join(root, file)), false);
  assert.equal(fs.existsSync(path.join(root, 'src/app/api/chat/route.ts')), true);
});

test('corporate acceptance atomically queues notifications instead of sending before saving', async () => {
  const jobs = [];
  const db = { $queryRaw: async () => [{ locked: 1 }], submissionReceipt: { findUnique: async () => null, create: async ({ data }) => ({ id: 'receipt-1', ...data }) }, businessContact: { create: async () => ({ id: 'contact-1' }) }, notificationJob: { createMany: async ({ data }) => { jobs.push(...data); } }, $transaction: async fn => fn(db) };
  const load = loader({ '@/lib/prisma': { prisma: db }, '@/lib/rate-limit': { consumeRateLimit: async () => {} } });
  const response = await load('src/app/api/business-contact/route.ts').POST(request({ idempotencyKey: 'qa-business-key-12345678', termsAccepted: true, termsVersion: '2026-10-11', companyName: 'Test', contactName: 'Test', email: 'test@example.com', inquiryType: '歌ってみたMIX・マスタリング', message: 'Test' }));
  assert.equal(response.status, 201);
  assert.ok(jobs.some(j => j.kind === 'BUSINESS_ADMIN_EMAIL' && j.entityId === 'contact-1'));
  assert.ok(jobs.every(j => !j.kind.endsWith('_RECEIPT_EMAIL')));
});

test('Discord overview covers order inputs and uses the original server quote, including zero and consultation prices', () => {
  const { discordNotification } = loader()('src/lib/notification-content.ts');
  const order = { clientName:'通知QA',clientEmail:'qa@example.invalid',contactMethod:'Discord',twitterId:'@qa',discordId:'qa',serviceType:'ORIGINAL',planId:'変更後のプラン',songTitle:"no man's world",options:'変更後',vocalKey:'-3',referenceUrl:'https://example.invalid/reference',referenceFidelity:'2',materialsUrl:'https://example.invalid/material',paymentMethod:'銀行振込',deadline:'2026-12-31',message:'ご要望 @everyone',activityPurpose:'YouTube',genre:'ポップス',lyricsStatus:'未定',vocalGuideStatus:'不要',price:999,basePrice:999,optionPrice:999 };
  const quote={plan:{name:'受付時のプラン'},price:12000,basePrice:10000,optionPrice:2000,options:[{name:'カットアップ',priceText:'1,000円',quantity:2}]};
  const {payload,fullText}=discordNotification(order,quote,'https://example.invalid/admin/orders/qa');
  const fields=Object.fromEntries(payload.embeds[0].fields.map(field=>[field.name,field.value]));
  assert.equal(fields['依頼者名'],order.clientName);assert.equal(fields['メールアドレス'],order.clientEmail);assert.equal(fields['希望する連絡手段'],'Discord');
  assert.equal(fields['プラン'],'受付時のプラン');assert.equal(fields['受付時点の概算金額'],'12,000円（税込）');assert.match(fields['オプション'],/×2単位/);
  for(const value of [order.twitterId,order.discordId,order.songTitle,order.vocalKey,order.referenceUrl,order.materialsUrl,order.paymentMethod,order.deadline,order.message,order.activityPurpose,order.genre,order.lyricsStatus,order.vocalGuideStatus]) assert.ok(Object.values(fields).includes(value));
  assert.deepEqual(payload.allowed_mentions,{parse:[]});assert.equal(fullText,null);assert.doesNotMatch(JSON.stringify(payload),/受付番号|receiptNumber/);
  assert.equal(discordNotification(order,{...quote,price:0},'https://example.invalid/admin').payload.embeds[0].fields.find(f=>f.name==='受付時点の概算金額').value,'0円（税込）');
  assert.match(discordNotification({...order,planId:'無料相談'},{intent:'CONSULTATION',price:null},'https://example.invalid/admin').payload.embeds[0].fields.find(f=>f.name==='受付時点の概算金額').value,/無料相談/);
  assert.equal(discordNotification(order,{...quote,price:null},'https://example.invalid/admin').payload.embeds[0].fields.find(f=>f.name==='受付時点の概算金額').value,'内容確認後にご案内');
});

test('Discord long content stays within embed limits and includes an unabridged text attachment', () => {
  const { discordNotification } = loader()('src/lib/notification-content.ts');
  const record={companyName:'QA',contactName:'QA担当',email:'qa@example.invalid',inquiryType:'お見積り',budget:'10万円',deadline:'来月',message:'長文😀'.repeat(1000)};
  const {payload,fullText}=discordNotification(record,null,'https://example.invalid/admin');
  assert.ok(fullText.includes(record.message));assert.ok(payload.content.length<=2000);assert.ok(payload.embeds[0].fields.length<=25);
  assert.ok(payload.embeds[0].title.length+payload.embeds[0].fields.reduce((sum,f)=>sum+f.name.length+f.value.length,0)<=6000);
  assert.ok(payload.embeds[0].fields.every(f=>f.value.length<=1024&&!/[\uD800-\uDBFF]…$/.test(f.value)));
  for(const value of [record.companyName,record.contactName,record.email,record.inquiryType,record.budget,record.deadline]) assert.ok(fullText.includes(value));
});

test('notifications queue only admin channels and old receipt jobs never send, even on retry', async () => {
  const previous=process.env.DISCORD_WEBHOOK_URL;process.env.DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/qa/test';
  try {
    const queued=[],updates=[],mails=[];let pending=true;
    const job={id:'old-job',kind:'ORDER_RECEIPT_EMAIL',entityId:'qa',status:'FAILED',attempts:1,updatedAt:new Date(),lockedUntil:null};
    const db={notificationJob:{createMany:async({data})=>queued.push(...data),findFirst:async()=>pending?job:null,updateMany:async()=>({count:1}),update:async({data})=>{updates.push(data);pending=false;}}};
    const {queueNotifications,processPendingNotifications}=loader({'@/lib/prisma':{prisma:db},'@/lib/mail':{sendMail:async data=>mails.push(data)}})('src/lib/notifications.ts');
    await queueNotifications(db,'ORDER','qa');await queueNotifications(db,'BUSINESS','qb');
    assert.deepEqual(queued.map(j=>j.kind),['ORDER_ADMIN_EMAIL','ORDER_DISCORD','BUSINESS_ADMIN_EMAIL','BUSINESS_DISCORD']);
    assert.deepEqual(await processPendingNotifications(),{delivered:0,failed:0});assert.equal(mails.length,0);assert.equal(updates[0].status,'SKIPPED');assert.equal(updates[0].sentAt,null);
    assert.equal(loader()('src/lib/admin-notifications.ts').canRetryNotification(job),false);
  } finally {if(previous===undefined)delete process.env.DISCORD_WEBHOOK_URL;else process.env.DISCORD_WEBHOOK_URL=previous;}
});

test('Discord worker sends long-form multipart data with mentions disabled, and admin mail never targets the customer', async () => {
  const keys=['DISCORD_WEBHOOK_URL','ADMIN_NOTIFICATION_EMAIL'];const previous=keys.map(key=>[key,process.env[key]]);
  Object.assign(process.env,{DISCORD_WEBHOOK_URL:'https://discord.com/api/webhooks/qa/test',ADMIN_NOTIFICATION_EMAIL:'owner@example.invalid'});
  try {
    const record={companyName:'QA',contactName:'QA',email:'customer@example.invalid',inquiryType:'お見積り',message:'長文'.repeat(2500)};
    const jobs=['BUSINESS_DISCORD','BUSINESS_ADMIN_EMAIL'].map((kind,i)=>({id:`job-${i}`,kind,entityId:'qa',status:'PENDING',attempts:0,updatedAt:new Date(),lockedUntil:null}));
    const mailed=[],statuses=[];let index=0;
    const db={businessContact:{findUnique:async()=>record},submissionReceipt:{findUnique:async()=>({quote:{}})},notificationJob:{findFirst:async()=>jobs[index]??null,updateMany:async()=>({count:1}),update:async({data})=>{statuses.push(data.status);index++;}}};
    const {processPendingNotifications}=loader({'@/lib/prisma':{prisma:db},'@/lib/mail':{sendMail:async data=>mailed.push(data)},fetch:async(url,init)=>{
      assert.equal(new URL(url).searchParams.get('wait'),'true');assert.ok(init.body instanceof FormData);assert.equal(init.headers,undefined);
      const payload=JSON.parse(init.body.get('payload_json'));assert.deepEqual(payload.allowed_mentions,{parse:[]});
      assert.ok((await init.body.get('files[0]').text()).includes(record.message));return new Response(null,{status:204});
    }})('src/lib/notifications.ts');
    assert.deepEqual(await processPendingNotifications(),{delivered:2,failed:0});assert.deepEqual(statuses,['DELIVERED','DELIVERED']);
    assert.equal(mailed.length,1);assert.equal(mailed[0].to,'owner@example.invalid');assert.doesNotMatch(mailed[0].text,/受付番号/);
  } finally {for(const[key,value]of previous){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});

test('sitemap separates news and blog URLs and excludes unsupported types', async () => {
  const load = loader({ '@/lib/data/cms': { getAllPublishedPosts: async () => ['NEWS', 'BLOG', 'WORKS'].map(type => ({ id: type, type, updatedAt: new Date() })) } });
  const urls = (await load('src/app/sitemap.ts').default()).map(entry => entry.url);
  assert.ok(urls.some(url => url.endsWith('/news/NEWS')));
  assert.ok(urls.some(url => url.endsWith('/blog/BLOG')));
  assert.ok(!urls.some(url => url.endsWith('/blog/NEWS') || url.endsWith('/blog/WORKS')));
});

test('initial animation produces no SSR overlay', () => {
  const load = loader({ react: { useEffect() {}, useState: () => [false, () => {}] }, 'next/image': () => null });
  assert.equal(load('src/components/ui/OpeningAnimation.tsx').OpeningAnimation(), null);
});

test('shared rate store rejects exhausted budgets and fails closed on DB failure', async () => {
  for (const broken of [false, true]) {
    const db = {
      $transaction: async fn => fn(db),
      $executeRaw: async () => 0,
      $queryRaw: async query => {
        if (broken) throw Error('DB offline');
        return query.join('').includes('INSERT INTO') ? [] : [{ locked: 1 }];
      },
    };
    const load = loader({ '@/lib/prisma': { prisma: db } });
    await assert.rejects(() => load('src/lib/rate-limit.ts').consumeRateLimit('test', 1, 60), { status: broken ? 503 : 429 });
  }
});

test('public rate limit does not execute DDL or cleanup on request path', async () => {
  const queries = [];
  const db = { $queryRaw: async query => { queries.push(query.join('')); return [{ count: 1 }]; } };
  const load = loader({ '@/lib/prisma': { prisma: db } });
  await load('src/lib/rate-limit.ts').consumeRateLimit('test', 5, 60, 'visitor');
  assert.equal(queries.length, 1);
  assert.match(queries[0], /INSERT INTO/);
  assert.doesNotMatch(queries[0], /CREATE|DELETE/);
});

test('chat visitor cookie validates signature and separates independent visitors', () => {
  const prior = process.env.NEXTAUTH_SECRET;
  process.env.NEXTAUTH_SECRET = 'qa-secret-with-at-least-thirty-two-characters';
  try {
    const load = loader();
    const visitor = load('src/lib/chat-visitor.ts').chatVisitor;
    const first = visitor(new Request('https://qa.invalid/api/chat'));
    const second = visitor(new Request('https://qa.invalid/api/chat'));
    assert.notEqual(first.identity, second.identity);
    const cookie = first.cookie.split(';')[0];
    const same = visitor(new Request('https://qa.invalid/api/chat', { headers: { cookie } }));
    assert.equal(first.identity, same.identity);
    assert.equal(same.cookie, undefined);
    const forged = visitor(new Request('https://qa.invalid/api/chat', { headers: { cookie: cookie.slice(0, -1) + (cookie.endsWith('0') ? '1' : '0') } }));
    assert.notEqual(first.identity, forged.identity);
  } finally {
    if (prior === undefined) delete process.env.NEXTAUTH_SECRET; else process.env.NEXTAUTH_SECRET = prior;
  }
});

test('image uploads decode safely and reject corrupt data, SVG and unsafe URLs', async () => {
  const validate = loader()('src/lib/image-input.ts').validateImageSource;
  const sharp = nativeRequire('sharp');
  const image = await sharp({ create: { width: 20, height: 10, channels: 4, background: '#c2410c' } }).png().toBuffer();
  const result = await validate(`data:image/png;base64,${image.toString('base64')}`);
  assert.match(result, /^data:image\/webp;base64,/);
  for (const invalid of ['data:image/png;base64,YmFk', 'data:image/jpeg;base64,' + image.toString('base64'), 'data:image/svg+xml;base64,PHN2Zz4=', 'javascript:alert(1)', '//evil.invalid/a.png', 'https://user:password@evil.invalid/a.png']) {
    await assert.rejects(() => validate(invalid), { status: 400 });
  }
  assert.equal(await validate('/profile.jpg'), '/profile.jpg');
  assert.equal(await validate('https://qa.invalid/photo.png'), 'https://qa.invalid/photo.png');
});

test('login checks shared limits for both invalid and valid credentials', async () => {
  const previous = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'NEXTAUTH_SECRET'].map(key => [key, process.env[key]]);
  Object.assign(process.env, { ADMIN_USERNAME: 'admin-test', ADMIN_PASSWORD: 'test-password', NEXTAUTH_SECRET: 'test-secret' });
  try {
    for (const failure of [null, 429, 503]) {
      const calls = [];
      const load = loader({
        'next-auth': { getServerSession: async () => null },
        'next-auth/providers/credentials': options => options,
        '@/lib/rate-limit': { consumeRateLimit: async (...args) => {
          calls.push(args);
          if (failure) throw new (load('src/lib/api-input.ts').ApiError)(failure, 'blocked');
        } },
      });
      const authorize = load('src/lib/auth.ts').authOptions.providers[0].authorize;
      const credentials = { username: 'admin-test', password: 'test-password' };
      if (failure) {
        await assert.rejects(() => authorize({ username: 'admin-test', password: 'wrong' }), new RegExp(failure === 429 ? 'LOGIN_RATE_LIMITED' : 'LOGIN_UNAVAILABLE'));
      } else {
        assert.equal(await authorize({ username: 'different-name', password: 'wrong' }), null);
      }
      const beforeSuccess = calls.length;
      assert.equal((await authorize(credentials)).id, '1');
      assert.equal(calls.length, beforeSuccess, 'Valid administrator is not blocked by failed attempts');
      assert.equal(calls[0][0], 'admin-login-client');
      assert.equal(calls[0][1], 10);
      assert.match(calls[0][3], /^fallback:/);
      assert.ok(calls.length > 0);
    }
  } finally {
    for (const [key, value] of previous) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test('reading missing or existing reception settings never creates a DB record', async () => {
  for (const saved of [null, { acceptingOrders: false, orderStatus: 'UNAVAILABLE', announcement: 'Closed' }]) {
    let query;
    const load = loader({ '@/lib/prisma': { prisma: { siteSetting: {
      findUnique: async options => { query = options; return saved; },
      create() { throw Error('Public read must not create records'); },
      upsert() { throw Error('Public read must not update records'); },
    } } } });
    const result = await load('src/lib/data/site-setting.ts').getSiteSetting();
    assert.equal(result.orderStatus, saved?.orderStatus ?? 'UNAVAILABLE');
    assert.equal(result.acceptingOrders, false);
    assert.deepEqual(Object.keys(query.select).sort(), ['acceptingOrders', 'announcement', 'orderStatus']);
  }
});

function renderArticle(content) {
  const React = nativeRequire('react');
  const { renderToStaticMarkup } = nativeRequire('react-dom/server');
  const Markdown = nativeRequire('react-markdown').default;
  const raw = nativeRequire('rehype-raw').default;
  const slug = nativeRequire('rehype-slug').default;
  const gfm = nativeRequire('remark-gfm').default;
  const { rehypeArticleSanitize } = loader()('src/lib/article-sanitize.ts');
  return renderToStaticMarkup(React.createElement(Markdown, {
    remarkPlugins: [gfm], rehypePlugins: [raw, slug, rehypeArticleSanitize],
  }, content));
}

test('article rendering strips executable HTML and unsafe URLs', () => {
  const html = renderArticle('<script>alert(1)</script><iframe src="https://example.com"></iframe><style>body{display:none}</style><img src="/safe.png" onerror="alert(1)" style="position:fixed"><a href="javascript:alert(1)">bad</a><svg onload="alert(1)"></svg>');
  assert.doesNotMatch(html, /<script|<iframe|<style|<svg|onerror|onload|javascript:|position:fixed|alert\(1\)/);
  assert.match(html, /src="\/safe.png"/);
});

test('article rendering preserves safe structures, custom boxes, and heading links', () => {
  const html = renderArticle('## 見出し\n\n[移動](#見出し)\n\n<keypoints title="大切なこと">\n<ul><li>要点</li></ul>\n</keypoints>\n\n<details><summary>質問</summary>回答</details>\n\n| A | B |\n|---|---|\n| 1 | 2 |');
  assert.match(html, /id="user-content-見出し"/);
  assert.match(decodeURIComponent(html), /href="#user-content-見出し"/);
  assert.match(html, /<keypoints title="大切なこと">\s*<ul><li>要点<\/li><\/ul>\s*<\/keypoints>/);
  assert.match(html, /<table>/); assert.match(html, /<details><summary>質問<\/summary>/);
});

test('article footnote links stay aligned after sanitizing IDs', () => {
  const html = renderArticle('説明[^1]\n\n[^1]: 出典');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const links = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.ok(links.length >= 2);
  for (const target of links) assert.ok(ids.includes(target), 'Missing fragment target: ' + target);
});

test('API requires current consent and rejects forged enums and unsafe links before saving', async () => {
  for (const changes of [{termsAccepted:false},{termsVersion:'old'},{contactMethod:'unknown'},{contactMethod:'X (DM)',twitterId:''},{paymentMethod:'unknown'},{referenceUrl:'javascript:alert(1)'},{materialsUrl:'https://user:password@example.com'},{songTitle:''}]) {
    const {handler,saved}=orderHarness();const r=await handler(request({...validOrder,...changes}));assert.ok([400,409].includes(r.status));assert.equal(saved.length,0);
  }
});

test('every administrative page and layout checks authorization before reading data', async () => {
  function files(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
  const filesToCheck=files(path.join(root,'src/app/admin')).filter(f=>/(page|layout)\.tsx$/.test(f));
  for(const file of filesToCheck){
    const source=fs.readFileSync(file,'utf8');const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    const fn=ast.statements.find(s=>ts.isFunctionDeclaration(s)&&s.modifiers?.some(m=>m.kind===ts.SyntaxKind.DefaultKeyword));
    assert.match(fn.body.statements[0].getText(ast), /^await requireAdminPage\(\);$/,file);
  }
  assert.ok(filesToCheck.length>=20);
});

test('consultations accept an undecided plan without creating a paid quotation', async () => {
  const {handler,saved}=orderHarness();const r=await handler(request({...validOrder,intent:'CONSULTATION',planId:'',message:'どのプランがよいですか？'}));assert.equal(r.status,201);assert.equal(saved[0].price,null);assert.equal(saved[0].planId,'無料相談');assert.equal((await r.json()).orderId,'order-1');
});

test('cut-up price uses rounded ten-second quantities and rejects forged quantities', () => {
 const load=loader();const {calculateOrderPrice}=load('src/lib/order-pricing.ts');const {validateOptionQuantities}=load('src/lib/order-validation.ts');const options=[{id:'cut',name:'カットアップ',priceText:'2,000円'}];assert.equal(calculateOrderPrice({price:10000},options,{cut:3}).total,16000);assert.throws(()=>validateOptionQuantities({cut:0},options),{status:400});assert.throws(()=>validateOptionQuantities({unknown:3},options),{status:400});
});

test('submission failures explain uncertainty and retry limits, requiring a saved entity instead of a receipt number', async () => {
  for(const fetchMock of [async()=>{throw Error('network');},async()=>new Response('<html>upstream failure</html>',{status:502}),async()=>Response.json({success:true})]){
    const {submitForm}=loader({fetch:fetchMock})('src/lib/form-submission.ts');await assert.rejects(()=>submitForm('/api/orders',{}),/入力内容は保持/);
  }
  const {submitForm}=loader({fetch:async()=>Response.json({error:'limit'},{status:429,headers:{'Retry-After':'60'}})})('src/lib/form-submission.ts');await assert.rejects(()=>submitForm('/api/orders',{}),{retryAfter:60,status:429});
  const accepted=loader({fetch:async()=>Response.json({success:true,orderId:'saved-order'})})('src/lib/form-submission.ts');
  assert.deepEqual(await accepted.submitForm('/api/orders',{}),{entityId:'saved-order'});
  const business=loader({fetch:async()=>Response.json({success:true,contactId:'saved-contact'})})('src/lib/form-submission.ts');
  assert.deepEqual(await business.submitForm('/api/business-contact',{}),{entityId:'saved-contact'});
});

test('calendar titles include the customer and song, handling missing titles and existing honorifics', () => {
 const { deadlineEvent } = loader()('src/lib/calendar-event.ts');
 const order = { id: 'qa-order', serviceType: 'MIX', clientName: ' ゑゐ ', songTitle: " no man's world " };
 assert.equal(deadlineEvent(order, '2026-12-31').summary, "[納品期限] ゑゐ様 - ボーカルMIX (no man's world)");
 for (const songTitle of [null, '', '   ']) {
  assert.equal(deadlineEvent({ ...order, clientName: 'ゑゐ様', songTitle }, '2026-12-31').summary, '[納品期限] ゑゐ様 - ボーカルMIX');
 }
 assert.equal(deadlineEvent({ ...order, serviceType: 'GUIDE' }, '2026-12-31').summary, "[納品期限] ゑゐ様 - ボーカルガイド (no man's world)");
 assert.equal(deadlineEvent({ ...order, serviceType: 'ORIGINAL' }, '2026-12-31').summary, "[納品期限] ゑゐ様 - オリジナル楽曲 (no man's world)");
 assert.equal(deadlineEvent({ ...order, clientName: ' ' }, '2026-12-31').summary, "[納品期限] 受付 qa-order - ボーカルMIX (no man's world)");
});

test('calendar dates use an exclusive end and synchronization renames the existing event without duplication', async () => {
 const { deadlineEvent, upsertDeadlineEvent } = loader()('src/lib/calendar-event.ts');
 const order = { id: 'qa-order', serviceType: 'MIX', clientName: 'ゑゐ', songTitle: "no man's world" };
 const event = deadlineEvent(order, '2026-12-31');
 assert.equal(event.end.date, '2027-01-01');
 assert.throws(() => deadlineEvent(order, '2026-02-30'));
 assert.equal(event.id, deadlineEvent(order, '2027-01-05').id);
 const stored = new Map(); let inserted = 0;
 const calendar = { events: {
  async update({ eventId, requestBody }) { if (!stored.has(eventId)) throw { code: 404 }; stored.set(eventId, requestBody); },
  async insert({ requestBody }) { inserted++; stored.set(requestBody.id, requestBody); }
 } };
 await upsertDeadlineEvent(calendar, 'qa', event);
 stored.set(event.id, { ...event, summary: '[納品期限] 受付 qa-order - ボーカルMIX' });
 await upsertDeadlineEvent(calendar, 'qa', deadlineEvent(order, '2027-01-05'));
 assert.equal(inserted, 1); assert.equal(stored.size, 1); assert.equal(stored.get(event.id).start.date, '2027-01-05');
 assert.equal(stored.get(event.id).summary, "[納品期限] ゑゐ様 - ボーカルMIX (no man's world)");
});

test('admin calendar sync uses saved customer and song data and rejects anonymous requests', async () => {
 const previous = ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_CALENDAR_ID'].map(key => [key, process.env[key]]);
 Object.assign(process.env, { GOOGLE_SERVICE_ACCOUNT_EMAIL: 'qa@example.invalid', GOOGLE_PRIVATE_KEY: 'qa-only', GOOGLE_CALENDAR_ID: 'qa-calendar' });
 try {
  let authorized = false, reads = 0;
  const events = [];
  const route = loader({
   '@/lib/admin-api-auth': { isAdminRequest: async () => authorized },
   '@/lib/prisma': { prisma: { order: { async findUnique({ where }) {
    reads++; assert.equal(where.id, 'qa-order');
    return { id: where.id, serviceType: 'MIX', clientName: 'ゑゐ', songTitle: "no man's world" };
   } } } },
   googleapis: { google: { auth: { JWT: class {} }, calendar: () => ({ events: {
    async update({ calendarId, requestBody }) { assert.equal(calendarId, 'qa-calendar'); events.push(requestBody); },
    async insert() { assert.fail('existing event should be updated'); },
   } }) } },
  })('src/app/api/admin/calendar/sync/route.ts');
  const body = { orderId: 'qa-order', deadline: '2026-12-31', clientName: 'untrusted input', songTitle: 'untrusted input' };
  assert.equal((await route.POST(request(body))).status, 401);
  assert.equal(reads, 0); assert.equal(events.length, 0);
  authorized = true;
  const response = await route.POST(request(body));
  assert.equal(response.status, 200); assert.equal((await response.json()).synced, true);
  assert.equal(events.length, 1);
  assert.equal(events[0].summary, "[納品期限] ゑゐ様 - ボーカルMIX (no man's world)");
 } finally {
  for (const [key, value] of previous) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
 }
});

test('Proxy denies anonymous management APIs and redirects pages, allowing only the admin token', async () => {
 const secret = process.env.NEXTAUTH_SECRET; process.env.NEXTAUTH_SECRET = 'qa-test-secret';
 try {
  let token = null;
  const responses = { json: Response.json, next: () => new Response(null, {status: 204}), redirect: url => new Response(null,{status:307,headers:{Location:url.toString()}}) };
  const proxy = loader({'next-auth/jwt': { getToken: async () => token }, 'next/server': { NextResponse: responses }})('src/proxy.ts').proxy;
  const req = pathname => ({ url:'http://localhost'+pathname, nextUrl: new URL('http://localhost'+pathname) });
  assert.equal((await proxy(req('/api/admin/orders/test'))).status, 401);
  assert.match((await proxy(req('/admin/orders'))).headers.get('Location'), /login\?callbackUrl=/);
  token = { email: 'someone@example.invalid' }; assert.equal((await proxy(req('/api/admin/orders/test'))).status,401);
  token = { email: 'admin@sien-official.com' }; assert.equal((await proxy(req('/admin/orders'))).status,204);
 } finally { if(secret===undefined)delete process.env.NEXTAUTH_SECRET;else process.env.NEXTAUTH_SECRET=secret; }
});

test('additive migrations are repeatable and leave unrelated existing data intact', async () => {
 const { PGlite } = await import('@electric-sql/pglite'); const db = await PGlite.create();
 try {
  await db.exec(`CREATE TABLE "ExistingOrder" (id text primary key); INSERT INTO "ExistingOrder" VALUES ('qa-existing'); CREATE TABLE "Order" (id text primary key); INSERT INTO "Order" VALUES ('qa-feedback');`);
  const directories = ['202610010001_notification_outbox','202610010002_submission_receipts','202610010003_rate_limit','202610110001_retire_receipt_numbers','202610270001_order_feedback'];
  const sql = directories.map(name => fs.readFileSync(path.join(root,'prisma/migrations',name,'migration.sql'),'utf8')).join('\n');
  await db.exec(sql); await db.exec(sql);
  assert.equal((await db.query('SELECT COUNT(*)::int AS count FROM "ExistingOrder"')).rows[0].count,1);
  const result = await db.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  assert.ok(['NotificationJob','SubmissionReceipt','ApiRateLimit','OrderFeedback'].every(name => result.rows.some(row => row.table_name===name)));
  await db.exec(`INSERT INTO "OrderFeedback" ("orderId",content,"updatedAt") VALUES ('qa-feedback','{}',CURRENT_TIMESTAMP); DELETE FROM "Order" WHERE id='qa-feedback';`);
  assert.equal((await db.query('SELECT COUNT(*)::int AS count FROM "OrderFeedback"')).rows[0].count,0);
  await db.exec(`INSERT INTO "SubmissionReceipt" (id,"requestKey","payloadHash","receiptNumber","entityType","entityId",quote) VALUES ('old','old-key','hash','S-OLD','ORDER','old-order','{}');`);
  await db.exec(sql);
  assert.equal((await db.query(`SELECT "receiptNumber" FROM "SubmissionReceipt" WHERE id='old'`)).rows[0].receiptNumber,'S-OLD');
  await db.exec(`INSERT INTO "SubmissionReceipt" (id,"requestKey","payloadHash","entityType","entityId",quote) VALUES ('new','new-key','hash','ORDER','new-order','{}');`);
  assert.equal((await db.query(`SELECT "receiptNumber" FROM "SubmissionReceipt" WHERE id='new'`)).rows[0].receiptNumber,null);
 } finally { await db.close(); }
});
