import fs from 'fs';
import path from 'path';

const originalPath = path.join(__dirname, '../src/app/original/page.tsx');
let originalContent = fs.readFileSync(originalPath, 'utf8');

originalContent = originalContent.replace(
  /publishedPortfolios\.map\(\(portfolio\) => \(/g,
  'publishedPortfolios.map((portfolio: any) => ('
);
originalContent = originalContent.replace(
  /portfolios\.map\(\(portfolio\) => \(/g,
  'publishedPortfolios.map((portfolio: any) => ('
);

fs.writeFileSync(originalPath, originalContent, 'utf8');
console.log('Fixed portfolio any type.');
