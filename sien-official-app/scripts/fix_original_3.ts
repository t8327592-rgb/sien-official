import fs from 'fs';
import path from 'path';

const originalPath = path.join(__dirname, '../src/app/original/page.tsx');
let originalContent = fs.readFileSync(originalPath, 'utf8');

originalContent = originalContent.replace(
  /\{plans\.map\(\(plan\) => \{/g,
  '{plans.map((plan: any) => {'
);
originalContent = originalContent.replace(
  /\{options\.filter\(o => o\.category === "ORIGINAL"\)\.map\(\(opt\) => \(/g,
  '{options.filter((o: any) => o.category === "ORIGINAL").map((opt: any) => ('
);

fs.writeFileSync(originalPath, originalContent, 'utf8');

const mixPath = path.join(__dirname, '../src/app/mix/page.tsx');
let mixContent = fs.readFileSync(mixPath, 'utf8');
mixContent = mixContent.replace(
  /\{options\.filter\(o => o\.category === "MIX"\)\.map\(\(opt\) => \(/g,
  '{options.filter((o: any) => o.category === "MIX").map((opt: any) => ('
);

fs.writeFileSync(mixPath, mixContent, 'utf8');

console.log('Added any types to plans and options in JSX.');
