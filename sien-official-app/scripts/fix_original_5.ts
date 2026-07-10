import fs from 'fs';
import path from 'path';

const originalPath = path.join(__dirname, '../src/app/original/page.tsx');
let originalContent = fs.readFileSync(originalPath, 'utf8');

originalContent = originalContent.replace(
  /portfolios\.length > 0/g,
  'publishedPortfolios.length > 0'
);

fs.writeFileSync(originalPath, originalContent, 'utf8');
console.log('Fixed portfolios.length.');
