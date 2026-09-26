const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

// Compile actual handlers in memory, replacing only external side effects.
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
    const module = { exports: {} }; cache.set(file, module);
    const requireMock = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name === '@/lib/mail') return { sendMail: async () => ({ success: true }) };
      if (name === 'next/server') return { NextResponse: Response };
      if (name === 'next/cache') return { revalidatePath() {}, unstable_cache: fn => fn };
      if (name.startsWith('@/')) {
        const base = 'src/' + name.slice(2);
        return load(fs.existsSync(path.join(root, base + '.ts')) ? base + '.ts' : base + '.tsx');
      }
      return require(name);
    };
    vm.runInThisContext('(function(require,module,exports,fetch){' + output + '\n})', { filename: file })(requireMock, module, module.exports, async () => Response.json({}));
    return module.exports;
  }
  return load;
}
const request = body => new Request('http://localhost/api/test', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const validOrder = { clientName: 'Test', clientEmail: 'test@example.com', serviceType: 'MIX', planId: 'plan-1', optionIds: [] };
const plan = { id: 'plan-1', name: 'スタンダードプラン', category: 'MIX', price: 10000, period: '7日', revisions: '5回' };
function orderHarness({ unavailable = false, options = [], missingPlan = false } = {}) {
  const saved = [];
  const db = {
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
  const routes = [...files(path.join(root, 'src/app/api/admin')), ...['posts', 'generate-post', 'generate-reply'].map(n => path.join(root, 'src/app/api', n, 'route.ts'))];
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
  assert.deepEqual(await response.json(), { success: true, orderId: 'order-1' });
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

test('input parser rejects malformed and oversized JSON, arrays, and email lists', async () => {
  const { readJson, emailField } = loader()('src/lib/api-input.ts');
  await assert.rejects(() => readJson(new Request('http://localhost', { method: 'POST', body: '{' })), { status: 400 });
  await assert.rejects(() => readJson(request([])), { status: 400 });
  await assert.rejects(() => readJson(request({ message: 'x'.repeat(25000) })), { status: 413 });
  assert.throws(() => emailField({ email: 'a@example.com,b@example.com' }, 'email'), { status: 400 });
});

test('corporate contact limits run before database saves and email sends', async () => {
  let calls = 0;
  const load = loader({ '@/lib/prisma': { prisma: { businessContact: { create() { calls++; } } } },
    '@/lib/rate-limit': { consumeRateLimit: async () => { throw new (load('src/lib/api-input.ts').ApiError)(429, 'limit'); } },
  });
  const response = await load('src/app/api/business-contact/route.ts').POST(request({ companyName: 'Test', contactName: 'Test', email: 'test@example.com', inquiryType: 'MIX', message: 'Test' }));
  assert.equal(response.status, 429); assert.equal(calls, 0);
});

test('AI reply resolves a saved Japanese plan name using current DB terms', async () => {
  let query, prompt;
  const load = loader({
    '@/lib/auth': { isAdmin: async () => true },
    '@/lib/rate-limit': { consumeRateLimit: async () => {} },
    '@/lib/prisma': { prisma: { plan: { findFirst: async q => { query = q; return { ...plan, price: 12345, period: '20日', revisions: '3回' }; } } } },
    '@google/generative-ai': { GoogleGenerativeAI: class { getGenerativeModel() { return { generateContent: async text => { prompt = text; return { response: { text: () => 'reply' } }; } }; } } },
  });
  const response = await load('src/app/api/generate-reply/route.ts').POST(request({ clientName: 'Test', planId: plan.name, serviceType: 'MIX' }));
  assert.equal(response.status, 200);
  assert.ok(query.where.OR.some(q => q.name === plan.name));
  assert.match(prompt, /12,345円/); assert.match(prompt, /20日/); assert.match(prompt, /3回/);
});

test('corporate auto-reply cannot relay attacker-provided text', async () => {
  const before = { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS };
  process.env.SMTP_USER = 'admin@example.invalid'; process.env.SMTP_PASS = 'test-only';
  const mails = [];
  try {
    const load = loader({
      '@/lib/prisma': { prisma: { businessContact: { create: async () => ({ id: 'contact-1' }) } } },
      '@/lib/rate-limit': { consumeRateLimit: async () => {} },
      '@/lib/mail': { sendMail: async mail => { mails.push(mail); return { success: true }; } },
    });
    const response = await load('src/app/api/business-contact/route.ts').POST(request({ companyName: 'UNTRUSTED', contactName: 'UNTRUSTED', email: 'test@example.com', inquiryType: 'UNTRUSTED', message: 'UNTRUSTED' }));
    assert.equal(response.status, 201);
    const reply = mails.find(mail => mail.to === 'test@example.com');
    assert.ok(reply); assert.doesNotMatch(reply.text, /UNTRUSTED/);
  } finally {
    if (before.user === undefined) delete process.env.SMTP_USER; else process.env.SMTP_USER = before.user;
    if (before.pass === undefined) delete process.env.SMTP_PASS; else process.env.SMTP_PASS = before.pass;
  }
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
        await assert.rejects(() => authorize(credentials), new RegExp(failure === 429 ? 'LOGIN_RATE_LIMITED' : 'LOGIN_UNAVAILABLE'));
      } else {
        assert.equal(await authorize({ username: 'different-name', password: 'wrong' }), null);
        assert.equal((await authorize(credentials)).id, '1');
      }
      assert.ok(calls.every(call => call[0] === 'admin-login' && call[1] === 10 && call[2] === 900 && call.length === 3));
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
    assert.equal(result.orderStatus, saved?.orderStatus ?? 'AVAILABLE');
    assert.deepEqual(Object.keys(query.select).sort(), ['acceptingOrders', 'announcement', 'orderStatus']);
  }
});

function renderArticle(content) {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const Markdown = require('react-markdown').default;
  const raw = require('rehype-raw').default;
  const slug = require('rehype-slug').default;
  const gfm = require('remark-gfm').default;
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
