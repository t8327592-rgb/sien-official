import fs from 'fs';
import path from 'path';

// 1. src/lib/data/cms.ts に getReviews, getNewsPosts を追加
const cmsPath = path.join(__dirname, '../src/lib/data/cms.ts');
let cmsContent = fs.readFileSync(cmsPath, 'utf8');

if (!cmsContent.includes('getReviews')) {
  const additionalMethods = `
// ---------------------------------------------------------
// Review (お客様の声)
// ---------------------------------------------------------
export const getReviews = unstable_cache(
  async (limit?: number) => {
    return await prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: 'asc' },
      ...(limit ? { take: limit } : {}),
    });
  },
  ['reviews'],
  { revalidate: 60, tags: ['reviews'] }
);

// ---------------------------------------------------------
// Post (ニュース・ブログ)
// ---------------------------------------------------------
export const getNewsPosts = unstable_cache(
  async (limit?: number) => {
    return await prisma.post.findMany({
      where: { type: "NEWS", published: true },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    });
  },
  ['news-posts'],
  { revalidate: 60, tags: ['news'] }
);
`;
  cmsContent += additionalMethods;
  fs.writeFileSync(cmsPath, cmsContent, 'utf8');
}

// 2. src/app/page.tsx で getReviews などを使っているので、prisma直接呼び出しを消す
const homePath = path.join(__dirname, '../src/app/page.tsx');
let homeContent = fs.readFileSync(homePath, 'utf8');
homeContent = homeContent.replace(
  /const \[reviews, siteSetting, newsPosts\] = await Promise\.all\(\[\r?\n\s*prisma\.review\.findMany\(\{\r?\n\s*where: \{ isPublished: true \},\r?\n\s*orderBy: \{ orderIndex: "asc" \},\r?\n\s*take: 3,\r?\n\s*\}\),\r?\n\s*getSiteSetting\(\),\r?\n\s*prisma\.post\.findMany\(\{\r?\n\s*where: \{ type: "NEWS", published: true \},\r?\n\s*orderBy: \{ createdAt: "desc" \},\r?\n\s*take: 3,\r?\n\s*\}\)\r?\n\s*\]\);/,
  `const [reviews, siteSetting, newsPosts] = await Promise.all([
    getReviews(3),
    getSiteSetting(),
    getNewsPosts(3)
  ]);`
);
fs.writeFileSync(homePath, homeContent, 'utf8');

// 3. PlanCard コンポーネントの型を Prisma の Plan に合わせるか、PlanListClient で渡す型を修正する。
// src/components/ui/PlanCard.tsx を修正する
const planCardPath = path.join(__dirname, '../src/components/ui/PlanCard.tsx');
let planCardContent = fs.readFileSync(planCardPath, 'utf8');
// PricingPlan -> Plan (Prisma type)
planCardContent = planCardContent.replace(
  /import \{ PricingPlan \} from "@\/types\/config";/,
  `import { Plan } from "@prisma/client";`
);
planCardContent = planCardContent.replace(/plan: PricingPlan;/g, 'plan: Plan;');
planCardContent = planCardContent.replace(/plan\.basePrice/g, 'plan.price');
planCardContent = planCardContent.replace(/plan\.deliveryEstimate/g, 'plan.period');
fs.writeFileSync(planCardPath, planCardContent, 'utf8');

// 4. src/components/ui/PlanListClient.tsx の修正
const planListClientPath = path.join(__dirname, '../src/components/ui/PlanListClient.tsx');
let planListClientContent = fs.readFileSync(planListClientPath, 'utf8');
planListClientContent = planListClientContent.replace(
  /import \{ PricingPlan \} from "@\/types\/config";/,
  `import { Plan } from "@prisma/client";`
);
planListClientContent = planListClientContent.replace(/plans: PricingPlan\[\];/g, 'plans: Plan[];');
fs.writeFileSync(planListClientPath, planListClientContent, 'utf8');

console.log('Fixed cms methods and types.');
