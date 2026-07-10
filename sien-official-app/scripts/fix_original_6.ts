import fs from 'fs';
import path from 'path';

const originalPath = path.join(__dirname, '../src/app/original/page.tsx');
let originalContent = fs.readFileSync(originalPath, 'utf8');

// Replace the entire DB fetching block
originalContent = originalContent.replace(
  /export const dynamic = "force-dynamic";\n\nexport default async function OriginalPage\(\) \{\n[\s\S]*?take: 2,\n\s*\}\);/g,
  `export default function OriginalPage() {
  const plans = pricingPlans.filter(p => p.isActive && p.category === "ORIGINAL");
  const options = pricingOptions.filter(o => o.isActive && (o.category === "ORIGINAL" || o.category === "COMMON"));
  const publishedPortfolios = portfolios.filter(p => p.category === "ORIGINAL").slice(0, 4);`
);

fs.writeFileSync(originalPath, originalContent, 'utf8');
console.log('Fixed DB fetch in original page.');
