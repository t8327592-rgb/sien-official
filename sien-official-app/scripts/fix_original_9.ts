import fs from 'fs';
import path from 'path';

const originalPath = path.join(__dirname, '../src/app/original/page.tsx');
let originalContent = fs.readFileSync(originalPath, 'utf8');

// 1. imports
originalContent = originalContent.replace(
  /import \{ prisma \} from "@\/lib\/prisma";/,
  `import { pricingPlans, pricingOptions } from "@/config/pricing";\nimport { portfolios } from "@/data/portfolio";`
);

// 2. DB fetch block
originalContent = originalContent.replace(
  /export const dynamic = "force-dynamic";\r?\n\r?\nexport default async function OriginalPage\(\) \{\r?\n[\s\S]*?take: 2,\r?\n\s*\}\);/,
  `export default function OriginalPage() {\n  const plans = pricingPlans.filter(p => p.isActive && p.category === "ORIGINAL");\n  const options = pricingOptions.filter(o => o.isActive && (o.category === "ORIGINAL" || o.category === "COMMON"));\n  const publishedPortfolios = portfolios.filter(p => p.category === "ORIGINAL").slice(0, 4);`
);

// 3. JSX fixing
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
console.log('Fixed DB fetch in original page with CRLF support.');
