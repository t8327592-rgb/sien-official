import fs from 'fs';
import path from 'path';

const mixPagePath = path.join(__dirname, '../src/app/mix/page.tsx');
let content = fs.readFileSync(mixPagePath, 'utf8');

// 1. imports and dynamic config
content = content.replace(
  /import \{ prisma \} from "@\/lib\/prisma";/,
  `import { pricingPlans, pricingOptions } from "@/config/pricing";\nimport { portfolios } from "@/data/portfolio";\nimport { activeCampaigns } from "@/config/campaigns";`
);

content = content.replace(
  /\/\/ データの動的取得を強制（キャッシュ無効化）\nexport const dynamic = "force-dynamic";\n\nexport default async function MixPage\(\) \{\n  const plans = await prisma\.plan\.findMany\(\{\n    where: \{ isActive: true, category: "MIX" \},\n    orderBy: \{ orderIndex: 'asc' \} \/\/ DB側で指定したorderIndexでソート\n  \}\);\n\n  const options = await prisma\.option\.findMany\(\{\n    where: \{ isActive: true \},\n    orderBy: \{ orderIndex: 'asc' \}\n  \}\);\n\n  const portfolios = await prisma\.portfolio\.findMany\(\{\n    where: \{ isActive: true \},\n    orderBy: \{ orderIndex: 'asc' \},\n    take: 4\n  \}\);/,
  `export default function MixPage() {\n  const plans = pricingPlans.filter(p => p.isActive && p.category === "MIX");\n  const options = pricingOptions.filter(o => o.isActive && o.category === "MIX" || o.category === "COMMON");\n  const publishedPortfolios = portfolios.filter(p => p.category === "MIX").slice(0, 4);`
);

// Prisma特有のコード（where: { isPublished: true } 等が含まれている場合）
content = content.replace(
  /\/\/ データの動的取得を強制（キャッシュ無効化）\nexport const dynamic = "force-dynamic";\n\nexport default async function MixPage\(\) \{\n[\s\S]*?take: 4\n  \}\);/g,
  `export default function MixPage() {\n  const plans = pricingPlans.filter(p => p.isActive && p.category === "MIX");\n  const options = pricingOptions.filter(o => o.isActive && (o.category === "MIX" || o.category === "COMMON"));\n  const publishedPortfolios = portfolios.filter(p => p.category === "MIX").slice(0, 4);`
);

// 2. portfolios -> publishedPortfolios in JSX
content = content.replace(/\{portfolios\.length > 0 \? portfolios\.map\(\(portfolio\) => \(/g, '{publishedPortfolios.length > 0 ? publishedPortfolios.map((portfolio) => (');

// 3. portfolio.url -> portfolio.youtubeUrl in JSX
content = content.replace(/portfolio\.url/g, 'portfolio.youtubeUrl');

fs.writeFileSync(mixPagePath, content, 'utf8');

const originalPagePath = path.join(__dirname, '../src/app/original/page.tsx');
let originalContent = fs.readFileSync(originalPagePath, 'utf8');

// 1. imports and dynamic config
originalContent = originalContent.replace(
  /import \{ prisma \} from "@\/lib\/prisma";/,
  `import { pricingPlans, pricingOptions } from "@/config/pricing";\nimport { portfolios } from "@/data/portfolio";`
);

originalContent = originalContent.replace(
  /\/\/ データの動的取得を強制（キャッシュ無効化）\nexport const dynamic = "force-dynamic";\n\nexport default async function OriginalPage\(\) \{\n[\s\S]*?take: 4\n  \}\);/g,
  `export default function OriginalPage() {\n  const plans = pricingPlans.filter(p => p.isActive && p.category === "ORIGINAL");\n  const options = pricingOptions.filter(o => o.isActive && (o.category === "ORIGINAL" || o.category === "COMMON"));\n  const publishedPortfolios = portfolios.filter(p => p.category === "ORIGINAL").slice(0, 4);`
);

// 2. portfolios -> publishedPortfolios in JSX
originalContent = originalContent.replace(/\{portfolios\.length > 0 \? portfolios\.map\(\(portfolio\) => \(/g, '{publishedPortfolios.length > 0 ? publishedPortfolios.map((portfolio) => (');

// 3. portfolio.url -> portfolio.youtubeUrl in JSX
originalContent = originalContent.replace(/portfolio\.url/g, 'portfolio.youtubeUrl');

fs.writeFileSync(originalPagePath, originalContent, 'utf8');

console.log('Refactoring complete.');
