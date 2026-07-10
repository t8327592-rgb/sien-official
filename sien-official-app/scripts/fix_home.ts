import fs from 'fs';
import path from 'path';

const homePath = path.join(__dirname, '../src/app/page.tsx');
let homeContent = fs.readFileSync(homePath, 'utf8');

// imports
homeContent = homeContent.replace(
  'import { getSiteSetting } from "@/app/actions/settings";',
  'import { getSiteSetting } from "@/app/actions/settings";\nimport { portfolios } from "@/data/portfolio";'
);

// Prisma calls -> config for portfolios
homeContent = homeContent.replace(
  /const \[mixPortfolios, originalPortfolios, reviews, siteSetting, newsPosts\] = await Promise\.all\(\[\n\s*prisma\.portfolio\.findMany\(\{\n\s*where: \{ isFeatured: true, serviceCategory: \{ not: "オリジナル楽曲制作" \} \},\n\s*orderBy: \{ orderIndex: "asc" \},\n\s*take: 4,\n\s*\}\),\n\s*prisma\.portfolio\.findMany\(\{\n\s*where: \{ isFeatured: true, serviceCategory: "オリジナル楽曲制作" \},\n\s*orderBy: \{ orderIndex: "asc" \},\n\s*take: 3,\n\s*\}\),\n\s*prisma\.review\.findMany\(\{\n\s*where: \{ isPublished: true \},\n\s*orderBy: \{ orderIndex: "asc" \},\n\s*take: 3,\n\s*\}\),\n\s*getSiteSetting\(\),\n\s*prisma\.post\.findMany\(\{\n\s*where: \{ type: "NEWS", published: true \},\n\s*orderBy: \{ createdAt: "desc" \},\n\s*take: 3,\n\s*\}\)\n\s*\]\);/g,
  `const mixPortfolios = portfolios.filter(p => p.category !== "ORIGINAL").slice(0, 4);
  const originalPortfolios = portfolios.filter(p => p.category === "ORIGINAL").slice(0, 3);
  
  const [reviews, siteSetting, newsPosts] = await Promise.all([
    prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: "asc" },
      take: 3,
    }),
    getSiteSetting(),
    prisma.post.findMany({
      where: { type: "NEWS", published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    })
  ]);`
);

// JSX usage of portfolio
// mixPortfolios.map や originalPortfolios.map の中で url が参照されているなら youtubeUrl に置換する
homeContent = homeContent.replace(/portfolio\.url/g, 'portfolio.youtubeUrl');

fs.writeFileSync(homePath, homeContent, 'utf8');
console.log('Fixed home page.');
