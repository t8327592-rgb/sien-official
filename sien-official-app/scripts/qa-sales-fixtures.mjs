import { createHash } from 'node:crypto';
export async function seedSales(prisma) {
  if (process.env.QA_SALES !== '1') throw Error('Isolated sales QA only');
  await prisma.order.createMany({ data: [
    { id: 'qa-sales-duplicate', clientName: '集計確認A', songTitle: '同じ明細', clientEmail: 'a@example.invalid', serviceType: 'MIX', status: 'COMPLETED', confirmedPrice: 10000, revenueAt: new Date('2026-10-31T15:30:00Z') },
    { id: 'qa-sales-direct', clientName: '集計確認B', companyName: '集計確認法人', customerType: 'BUSINESS', songTitle: '直接依頼の曲', clientEmail: 'b@example.invalid', serviceType: 'MIX', status: 'COMPLETED', confirmedPrice: 5000, revenueAt: new Date('2025-12-31T00:00:00+09:00'), isArchived: true },
  ] });
  await prisma.paymentRecord.createMany({ data: [
    { id: 'qa-sales-payment-duplicate', orderId: 'qa-sales-duplicate', requestKey: 'qa-sales-duplicate', amount: 7000, fee: 2000, withholding: 1000, paidAt: new Date('2026-11-01T00:00:00+09:00') },
    { id: 'qa-sales-payment-direct', orderId: 'qa-sales-direct', requestKey: 'qa-sales-direct', amount: 4000, fee: 100, withholding: 900, paidAt: new Date('2026-11-10T00:00:00+09:00') },
    { id: 'qa-sales-refund', orderId: 'qa-sales-direct', requestKey: 'qa-sales-refund', kind: 'REFUND', amount: 500, paidAt: new Date('2026-11-11T00:00:00+09:00') },
    { id: 'qa-sales-voided', orderId: 'qa-sales-direct', requestKey: 'qa-sales-voided', amount: 999999, paidAt: new Date('2026-11-01T00:00:00+09:00'), voidedAt: new Date(), voidReason: 'QA取消' },
  ] });
  const defs = [
    ['duplicate', '2026-11-02', '集計確認A', '同じ明細', 10000, 2000, 1000, 7000, '送金済み'],
    ['extra', '2026-11-03', '集計確認A', '同じ明細', 1000, 200, 100, 500, '送金済み'],
    ['unconfirmed', '2026-11-15', '集計確認C', '未計上の曲', 8000, 1000, 500, 5000, '送金済み'],
    ['crossyear', '2025-12-31', '集計確認D', '年をまたぐ曲', 2500, 250, 250, 2000, '送金済み'],
    ['unpaid', '2026-11-20', '集計確認E', '未送金の曲', 4000, 600, 400, 3000, '送金待ち'],
  ];
  for (const [id, sentOn, clientName, songTitle, gross, fee, withholding, net, paymentStatus] of defs) {
    const cells = [sentOn, songTitle, 'ボーカルミックス', clientName, String(gross), String(fee), String(withholding), String(net), paymentStatus];
    await prisma.pxEntry.create({ data: { id: `qa-sales-px-${id}`, sentOn, clientName, songTitle, category: 'ボーカルミックス', gross, fee, withholding, net, paymentStatus, fingerprint: createHash('sha256').update(JSON.stringify(cells)).digest('hex'), rawCells: cells } });
  }
}
