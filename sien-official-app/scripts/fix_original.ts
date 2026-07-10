import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../src/app/original/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// imports
content = content.replace(
  'import { prisma } from "@/lib/prisma";',
  'import { pricingPlans, pricingOptions } from "@/config/pricing";\nimport { portfolios } from "@/data/portfolio";'
);

// DB calls -> config filtering
const dbCallsRegex = /\/\/ データの動的取得を強制（キャッシュ無効化）\nexport const dynamic = "force-dynamic";\n\nexport default async function OriginalPage\(\) \{\n  const plans = await prisma\.plan\.findMany\([\s\S]*?take: 2,\n  \}\);/g;

content = content.replace(dbCallsRegex, `export default function OriginalPage() {
  const plans = pricingPlans.filter(p => p.isActive && p.category === "ORIGINAL");
  const options = pricingOptions.filter(o => o.isActive && (o.category === "ORIGINAL" || o.category === "COMMON"));
  const publishedPortfolios = portfolios.filter(p => p.category === "ORIGINAL" && p.isPublished).slice(0, 4);`);

// portfolios -> publishedPortfolios in JSX
content = content.replace(
  /\{portfolios\.length > 0 \? \(\n\s*portfolios\.map\(\(portfolio\) => \(/g,
  '{publishedPortfolios.length > 0 ? (\n              publishedPortfolios.map((portfolio) => ('
);

// portfolio.url -> portfolio.youtubeUrl
content = content.replace(/portfolio\.url/g, 'portfolio.youtubeUrl');

fs.writeFileSync(filePath, content, 'utf8');
console.log('original page fixed.');
