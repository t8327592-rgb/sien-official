import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs';

async function main() {
  const data = JSON.parse(fs.readFileSync('C:\\Users\\shien\\OneDrive\\デスクトップ\\Sien-Official\\_old_html_site\\temp.json', 'utf8'));
  const oldMixPlans = data.prices.mix || [];
  const oldOrigPlans = data.prices.orig || [];
  
  const allOldPlans = [...oldMixPlans, ...oldOrigPlans];
  
  const plans = await prisma.plan.findMany();
  
  let updateCount = 0;
  for (const plan of plans) {
    // 完パケプランなどの名前のゆれに対応
    let matchingOldPlan = allOldPlans.find(op => op.title === plan.name);
    
    // フルパッケージプラン -> 完パケプラン の名前変更に対応
    if (!matchingOldPlan && plan.name === 'フルパッケージプラン') {
      matchingOldPlan = allOldPlans.find(op => op.title === '完パケプラン');
    }
    
    if (matchingOldPlan) {
      await prisma.plan.update({
        where: { id: plan.id },
        data: {
          period: matchingOldPlan.period,
          revisions: matchingOldPlan.revisions
        }
      });
      console.log(`Updated ${plan.name} with period=${matchingOldPlan.period}, revisions=${matchingOldPlan.revisions}`);
      updateCount++;
    } else {
      console.log(`No match found for ${plan.name}`);
    }
  }
  
  console.log(`Successfully updated ${updateCount} plans.`);
}

main().finally(() => prisma.$disconnect());
