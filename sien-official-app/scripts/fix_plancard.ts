import fs from 'fs';
import path from 'path';

// 1. PlanCard の修正
const planCardPath = path.join(__dirname, '../src/components/ui/PlanCard.tsx');
let planCardContent = fs.readFileSync(planCardPath, 'utf8');

// features (JSON) -> string[] にパースする処理を追加するか、とりあえず JSON.parse(plan.features) で取り出す
planCardContent = planCardContent.replace(
  /const features = plan\.features \|\| \[\];/,
  `let features: string[] = [];
  try {
    features = plan.features ? JSON.parse(plan.features) : [];
    if (!Array.isArray(features)) features = [];
  } catch (e) {
    features = plan.features ? plan.features.split('\\n') : [];
  }`
);

// price が null の場合
planCardContent = planCardContent.replace(
  /\{plan\.price\.toLocaleString\(\)\}/,
  '{plan.price ? plan.price.toLocaleString() : "要相談"}'
);

// shortDescription -> description
planCardContent = planCardContent.replace(
  /plan\.shortDescription/g,
  'plan.description'
);

fs.writeFileSync(planCardPath, planCardContent, 'utf8');


// 2. PlanListClient の修正
const planListClientPath = path.join(__dirname, '../src/components/ui/PlanListClient.tsx');
let planListClientContent = fs.readFileSync(planListClientPath, 'utf8');
planListClientContent = planListClientContent.replace(
  /PricingPlan/g,
  'Plan'
);
fs.writeFileSync(planListClientPath, planListClientContent, 'utf8');

console.log('Fixed PlanCard and PlanListClient types.');
