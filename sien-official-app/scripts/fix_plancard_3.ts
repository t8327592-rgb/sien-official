import fs from 'fs';
import path from 'path';

const planCardPath = path.join(__dirname, '../src/components/ui/PlanCard.tsx');
let planCardContent = fs.readFileSync(planCardPath, 'utf8');

// features error
planCardContent = planCardContent.replace(
  /let features: string\[\] = \[\];\r?\n\s*try \{\r?\n\s*const parsed = plan\.features \? JSON\.parse\(plan\.features\) : \[\];\r?\n\s*features = Array\.isArray\(parsed\) \? parsed : \[\];\r?\n\s*\} catch \(e\) \{\r?\n\s*features = plan\.features \? plan\.features\.split\('\\n'\) : \[\];\r?\n\s*\}/g,
  `let features: string[] = [];
  try {
    if (plan.features) {
      const parsed = JSON.parse(plan.features);
      features = Array.isArray(parsed) ? (parsed as string[]) : [];
    }
  } catch (e) {
    features = plan.features ? plan.features.split('\\n') : [];
  }`
);

// price error
planCardContent = planCardContent.replace(
  /\{plan\.price \!\= null \? plan\.price\.toLocaleString\(\) : "要相談"\}/g,
  '{plan.price != null ? plan.price.toLocaleString() : "要相談"}'
);
planCardContent = planCardContent.replace(
  /\(plan\.price \|\| 0\)\.toLocaleString\(\)/g,
  '(plan.price ?? 0).toLocaleString()'
);

fs.writeFileSync(planCardPath, planCardContent, 'utf8');
console.log('Fixed PlanCard types 3.');
