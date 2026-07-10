import fs from 'fs';
import path from 'path';

// -------------------------------------------------------------
// 1. src/app/original/page.tsx の置換
// -------------------------------------------------------------
const originalPath = path.join(__dirname, '../src/app/original/page.tsx');
let originalContent = fs.readFileSync(originalPath, 'utf8');

// imports
originalContent = originalContent.replace(
  /import \{ pricingPlans, pricingOptions \} from "@\/config\/pricing";\r?\nimport \{ portfolios \} from "@\/data\/portfolio";/,
  `import { getPlans, getOptions, getFeaturedPortfolios } from "@/lib/data/cms";`
);

// DB fetch block
originalContent = originalContent.replace(
  /export default function OriginalPage\(\) \{\r?\n\s*const plans = pricingPlans\.filter[\s\S]*?\.slice\(0, 4\);/,
  `export const dynamic = "force-dynamic";

export default async function OriginalPage() {
  const plans = await getPlans("ORIGINAL");
  const options = await getOptions("ORIGINAL");
  const publishedPortfolios = await getFeaturedPortfolios("ORIGINAL", 4);`
);

fs.writeFileSync(originalPath, originalContent, 'utf8');


// -------------------------------------------------------------
// 2. src/app/mix/page.tsx の置換
// -------------------------------------------------------------
const mixPath = path.join(__dirname, '../src/app/mix/page.tsx');
let mixContent = fs.readFileSync(mixPath, 'utf8');

// imports
mixContent = mixContent.replace(
  /import \{ pricingPlans, pricingOptions \} from "@\/config\/pricing";\r?\nimport \{ portfolios \} from "@\/data\/portfolio";/,
  `import { getPlans, getOptions, getFeaturedPortfolios } from "@/lib/data/cms";`
);

// DB fetch block
mixContent = mixContent.replace(
  /export default function MixPage\(\) \{\r?\n\s*const plans = pricingPlans\.filter[\s\S]*?\.slice\(0, 4\);/,
  `export const dynamic = "force-dynamic";

export default async function MixPage() {
  const plans = await getPlans("MIX");
  const options = await getOptions("MIX");
  const publishedPortfolios = await getFeaturedPortfolios("MIX", 4);`
);

fs.writeFileSync(mixPath, mixContent, 'utf8');


// -------------------------------------------------------------
// 3. src/app/order/page.tsx の置換
// -------------------------------------------------------------
const orderPath = path.join(__dirname, '../src/app/order/page.tsx');
let orderContent = fs.readFileSync(orderPath, 'utf8');

// imports
orderContent = orderContent.replace(
  /import \{ pricingPlans, pricingOptions \} from "@\/config\/pricing";/,
  `import { getPlans, getOptions } from "@/lib/data/cms";`
);

// array map
orderContent = orderContent.replace(
  /const plans = pricingPlans\.filter\([\s\S]*?priceText: o\.priceText\r?\n\s*\}\)\);/,
  `const rawPlans = await getPlans();
  const rawOptions = await getOptions();

  const plans = rawPlans.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price || null
  }));

  const options = rawOptions.map(o => ({
    id: o.id,
    name: o.name,
    category: o.category,
    priceText: o.priceText
  }));`
);

fs.writeFileSync(orderPath, orderContent, 'utf8');


// -------------------------------------------------------------
// 4. src/app/page.tsx (トップページ) の置換
// -------------------------------------------------------------
const homePath = path.join(__dirname, '../src/app/page.tsx');
let homeContent = fs.readFileSync(homePath, 'utf8');

// imports
homeContent = homeContent.replace(
  /import \{ portfolios \} from "@\/data\/portfolio";/,
  `import { getFeaturedPortfolios, getReviews, getNewsPosts } from "@/lib/data/cms";`
);

// DB fetch block
homeContent = homeContent.replace(
  /const mixPortfolios = portfolios\.filter[\s\S]*?take: 3,\r?\n\s*\}\)\r?\n\s*\]\);/,
  `const mixPortfolios = await getFeaturedPortfolios("MIX", 4);
  const originalPortfolios = await getFeaturedPortfolios("ORIGINAL", 3);
  
  const [reviews, siteSetting, newsPosts] = await Promise.all([
    prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: "asc" },
      take: 3,
    }),
    getSiteSetting(),
    prisma.post.findMany({
      where: { type: "NEWS", published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    })
  ]);`
);

fs.writeFileSync(homePath, homeContent, 'utf8');

console.log('Applied CMS architecture to pages.');
