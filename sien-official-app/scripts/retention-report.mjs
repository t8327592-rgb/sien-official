import { PrismaClient } from '@prisma/client';
// Read-only inventory. It deliberately has no delete/update mode.
const prisma = new PrismaClient();
if (!process.argv.includes('--deployment') && !(process.env.QA_ISOLATED === '1' && new URL(process.env.POSTGRES_PRISMA_URL || 'http://invalid').hostname === '127.0.0.1' && new URL(process.env.POSTGRES_PRISMA_URL).port === '55432')) throw Error('Select the deployment target with --deployment, or the isolated QA database explicitly');
try {
  const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 1);
  const completed = await prisma.order.count({ where: { status: 'COMPLETED', deliveredAt: { lt: cutoff } } });
  const cancelled = await prisma.order.count({ where: { status: { in: ['CANCELED', 'CANCELLED'] }, updatedAt: { lt: cutoff } } });
  const missingCompletionDate = await prisma.order.count({ where: { status: "COMPLETED", deliveredAt: null } });
  const business = await prisma.businessContact.count({ where: { status: { in: ["COMPLETED", "CANCELED", "CANCELLED"] }, updatedAt: { lt: cutoff } } });
  console.log(JSON.stringify({ policy: '業務完了後1年を基本。会計記録・紛争対応等の保管は別途確認', cutoff: cutoff.toISOString(), completed, cancelled, business, missingCompletionDate, dateNote: "法人完了・キャンセルは更新日時で候補抽出。実際の業務完了日と例外を確認する", action: 'READ_ONLY_NO_DELETION' }, null, 2));
} finally { await prisma.$disconnect(); }
