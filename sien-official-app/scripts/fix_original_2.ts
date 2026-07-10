import fs from 'fs';
import path from 'path';

const originalPath = path.join(__dirname, '../src/app/original/page.tsx');
let originalContent = fs.readFileSync(originalPath, 'utf8');
originalContent = originalContent.replace(
  /const publishedPortfolios = portfolios\.filter\(p => p\.category === "ORIGINAL" && p\.isPublished\)\.slice\(0, 4\);/,
  'const publishedPortfolios = portfolios.filter(p => p.category === "ORIGINAL").slice(0, 4);'
);
fs.writeFileSync(originalPath, originalContent, 'utf8');

const mixPath = path.join(__dirname, '../src/app/mix/page.tsx');
let mixContent = fs.readFileSync(mixPath, 'utf8');
mixContent = mixContent.replace(
  /const publishedPortfolios = portfolios\.filter\(p => p\.category === "MIX" && p\.isPublished\)\.slice\(0, 4\);/,
  'const publishedPortfolios = portfolios.filter(p => p.category === "MIX").slice(0, 4);'
);
// 型推論エラーを避けるために明示的な型をつける
mixContent = mixContent.replace(
  /\{publishedPortfolios\.length > 0 \? publishedPortfolios\.map\(\(portfolio\) => \(/g,
  '{publishedPortfolios.length > 0 ? publishedPortfolios.map((portfolio: any) => ('
);
originalContent = originalContent.replace(
  /\{publishedPortfolios\.length > 0 \? \(\n\s*publishedPortfolios\.map\(\(portfolio\) => \(/g,
  '{publishedPortfolios.length > 0 ? (\n              publishedPortfolios.map((portfolio: any) => ('
);

fs.writeFileSync(originalPath, originalContent, 'utf8');
fs.writeFileSync(mixPath, mixContent, 'utf8');

console.log('Fixed portfolios.filter and added any types to portfolio params.');
