import fs from 'fs';
import path from 'path';

const planCardPath = path.join(__dirname, '../src/components/ui/PlanCard.tsx');
let planCardContent = fs.readFileSync(planCardPath, 'utf8');

// features error: Type 'string | never[]' is not assignable to type 'string[]'.
planCardContent = planCardContent.replace(
  /let features: string\[\] = \[\];\s*try \{\s*features = plan\.features \? JSON\.parse\(plan\.features\) : \[\];\s*if \(\!Array\.isArray\(features\)\) features = \[\];\s*\} catch \(e\) \{\s*features = plan\.features \? plan\.features\.split\('\\n'\) : \[\];\s*\}/g,
  `let features: string[] = [];
  try {
    const parsed = plan.features ? JSON.parse(plan.features) : [];
    features = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    features = plan.features ? plan.features.split('\\n') : [];
  }`
);

// price error: 'plan.price' is possibly 'null'.
planCardContent = planCardContent.replace(
  /\{plan\.price \? plan\.price\.toLocaleString\(\) : "要相談"\}/g,
  '{plan.price != null ? plan.price.toLocaleString() : "要相談"}'
);
planCardContent = planCardContent.replace(
  /plan\.price\.toLocaleString\(\)/g,
  '(plan.price || 0).toLocaleString()'
);

fs.writeFileSync(planCardPath, planCardContent, 'utf8');
console.log('Fixed PlanCard types 2.');
