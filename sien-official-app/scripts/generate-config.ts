import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.plan.findMany({ orderBy: { orderIndex: 'asc' } });
  const options = await prisma.option.findMany({ orderBy: { orderIndex: 'asc' } });
  const portfolios = await prisma.portfolio.findMany({ orderBy: { orderIndex: 'asc' } });

  const pricingTsContent = `import { PricingPlan, PricingOption } from "../types/config";

export const pricingPlans: PricingPlan[] = ${JSON.stringify(plans.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    shortDescription: p.description,
    basePrice: p.price,
    features: p.features ? JSON.parse(p.features) : [],
    deliveryEstimate: p.period,
    revisions: p.revisions,
    isActive: p.isActive
})), null, 2)};

export const pricingOptions: PricingOption[] = ${JSON.stringify(options.map(o => ({
    id: o.id,
    name: o.name,
    category: o.category,
    priceText: o.priceText,
    price: 0, // ※priceTextから解析するロジックが必要だが、とりあえず0
    description: o.description,
    isActive: o.isActive
})), null, 2)};
`;

  const portfolioTsContent = `import { Portfolio } from "../types/config";

export const portfolios: Portfolio[] = ${JSON.stringify(portfolios.map(p => ({
    id: p.id,
    title: p.title,
    artistName: "", // 後で適当に入れるか空にする
    category: p.serviceCategory || "MIX",
    youtubeUrl: p.url || "",
    publishedAt: p.createdAt.toISOString()
})), null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/config/pricing.ts'), pricingTsContent);
  fs.writeFileSync(path.join(__dirname, '../src/data/portfolio.ts'), portfolioTsContent);
  
  console.log("Generated src/config/pricing.ts and src/data/portfolio.ts");
}

main().catch(console.error).finally(() => prisma.$disconnect());
