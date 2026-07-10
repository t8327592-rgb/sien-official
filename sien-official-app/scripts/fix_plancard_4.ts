import fs from 'fs';
import path from 'path';

const planCardPath = path.join(__dirname, '../src/components/ui/PlanCard.tsx');
let planCardContent = fs.readFileSync(planCardPath, 'utf8');

// 徹底的に置換する
const regex = /let features: string\[\] = \[\];[\s\S]*?features = plan\.features \? plan\.features\.split\('\\n'\) : \[\];\s*\}/;
planCardContent = planCardContent.replace(regex, `let featuresList: string[] = [];
  if (plan.features) {
    try {
      const parsed = JSON.parse(plan.features);
      featuresList = Array.isArray(parsed) ? parsed : [];
    } catch {
      featuresList = plan.features.split('\\n');
    }
  }`);

// 上記置換が使われていない場合、plan.features || [] を探して置き換える
if (planCardContent.includes('let featuresList: string[] = plan.features || [];')) {
  planCardContent = planCardContent.replace(
    /let featuresList: string\[\] = plan\.features \|\| \[\];/,
    `let featuresList: string[] = [];
  if (plan.features) {
    try {
      const parsed = JSON.parse(plan.features);
      featuresList = Array.isArray(parsed) ? parsed : [];
    } catch {
      featuresList = plan.features.split('\\n');
    }
  }`
  );
}

fs.writeFileSync(planCardPath, planCardContent, 'utf8');

// src/app/actions/cms.ts の revalidateTag を revalidatePath に変更
const cmsPath = path.join(__dirname, '../src/app/actions/cms.ts');
let cmsContent = fs.readFileSync(cmsPath, 'utf8');
cmsContent = cmsContent.replace(/import \{ revalidateTag \} from "next\/cache";/, 'import { revalidatePath } from "next/cache";');
cmsContent = cmsContent.replace(/revalidateTag\("site-settings"\);/g, 'revalidatePath("/", "layout");');
cmsContent = cmsContent.replace(/revalidateTag\("profile"\);/g, 'revalidatePath("/", "layout");');
cmsContent = cmsContent.replace(/revalidateTag\("faqs"\);/g, 'revalidatePath("/", "layout");');
cmsContent = cmsContent.replace(/revalidateTag\("services"\);/g, 'revalidatePath("/", "layout");');
fs.writeFileSync(cmsPath, cmsContent, 'utf8');

console.log('Fixed errors.');
