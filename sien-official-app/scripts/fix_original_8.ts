import fs from 'fs';
import path from 'path';

const originalPath = path.join(__dirname, '../src/app/original/page.tsx');
let originalContent = fs.readFileSync(originalPath, 'utf8');

const targetStr = `export const dynamic = "force-dynamic";

export default async function OriginalPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true, category: "ORIGINAL" },
    orderBy: { orderIndex: 'asc' } // DB側で指定したorderIndexでソート
  });

  const options = await prisma.option.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: 'asc' }
  });

  const portfolios = await prisma.portfolio.findMany({
    where: { serviceCategory: "ORIGINAL" },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });`;

const replacementStr = `export default function OriginalPage() {
  const plans = pricingPlans.filter(p => p.isActive && p.category === "ORIGINAL");
  const options = pricingOptions.filter(o => o.isActive && (o.category === "ORIGINAL" || o.category === "COMMON"));
  const publishedPortfolios = portfolios.filter(p => p.category === "ORIGINAL").slice(0, 4);`;

if (originalContent.includes(targetStr)) {
  originalContent = originalContent.replace(targetStr, replacementStr);
  console.log("Successfully replaced DB fetching block.");
} else {
  console.log("Target string not found.");
}

originalContent = originalContent.replace(
  /portfolios\.length > 0 \? \(/g,
  'publishedPortfolios.length > 0 ? ('
);

originalContent = originalContent.replace(
  /portfolios\.map\(\(portfolio\) => \(/g,
  'publishedPortfolios.map((portfolio: any) => ('
);

originalContent = originalContent.replace(
  /\{plans\.map\(\(plan\) => \{/g,
  '{plans.map((plan: any) => {'
);

originalContent = originalContent.replace(
  /\{options\.filter\(o => o\.category === "ORIGINAL"\)\.map\(\(opt\) => \(/g,
  '{options.filter((o: any) => o.category === "ORIGINAL").map((opt: any) => ('
);

originalContent = originalContent.replace(/portfolio\.url/g, 'portfolio.youtubeUrl');

fs.writeFileSync(originalPath, originalContent, 'utf8');
