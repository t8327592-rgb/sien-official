import fs from 'fs';
import path from 'path';

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const campaignModel = `
// キャンペーン・セール用モデル
model Campaign {
  id              String   @id @default(cuid())
  name            String   // キャンペーン名 (例: 春のVTuber応援セール)
  targetPlanId    String?  // 対象となるプランID (nullの場合は全プラン対象などの運用)
  originalPrice   Int?     // 通常価格 (参考表示用)
  campaignPrice   Int      // キャンペーン価格
  startDate       DateTime? // 開始日
  endDate         DateTime? // 終了日
  isActive        Boolean  @default(true) // 有効・無効
  description     String?  // キャンペーンの条件や説明
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
`;

if (!schemaContent.includes('model Campaign')) {
  schemaContent += campaignModel;
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  console.log('Campaign model added to schema.');
} else {
  console.log('Campaign model already exists.');
}
