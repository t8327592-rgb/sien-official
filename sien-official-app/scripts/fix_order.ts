import fs from 'fs';
import path from 'path';

const orderPath = path.join(__dirname, '../src/app/order/page.tsx');
let orderContent = fs.readFileSync(orderPath, 'utf8');

// 1. imports
orderContent = orderContent.replace(
  'import { prisma } from "@/lib/prisma";',
  'import { pricingPlans, pricingOptions } from "@/config/pricing";'
);

// 2. DB calls
const targetRegex = /const plans = await prisma\.plan\.findMany\(\{\s*where: \{ isActive: true \},\s*select: \{\s*id: true,\s*name: true,\s*category: true,\s*price: true,\s*\},\s*orderBy: \{ createdAt: "asc" \}\s*\}\);\s*const options = await prisma\.option\.findMany\(\{\s*where: \{ isActive: true \},\s*select: \{\s*id: true,\s*name: true,\s*category: true,\s*priceText: true,\s*\},\s*orderBy: \{ createdAt: "asc" \}\s*\}\);/g;

const replacement = `const plans = pricingPlans.filter(p => p.isActive).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.basePrice || null
  }));

  const options = pricingOptions.filter(o => o.isActive).map(o => ({
    id: o.id,
    name: o.name,
    category: o.category,
    priceText: o.priceText
  }));`;

orderContent = orderContent.replace(targetRegex, replacement);

fs.writeFileSync(orderPath, orderContent, 'utf8');
console.log('Fixed order page.');
