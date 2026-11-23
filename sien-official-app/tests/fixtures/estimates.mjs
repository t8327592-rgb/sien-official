export function estimateFixtures() {
  const songs = ['チョコレーション', 'VOiCE', 'ストロボラスト', '愛言葉Ⅴ', '始発とカフカ', 'アスノヨゾラ哨戒班', 'ただ声一つ', 'ブレス・ユア・ブレス', 'まもりごと', 'ゆめむすび', 'しるべうた'];
  const plans = [{ id: 'estimate-normal', name: '通常MIX', category: 'MIX', price: 10000 }, { id: 'estimate-live', name: 'ライブ用MIX', category: 'MIX', price: 10000 }];
  const receipts = [];
  const orders = songs.map((songTitle, index) => {
    const plan = plans[index < 5 ? 0 : 1];
    const options = index === 1 || index === 2 ? [{ id: 'cut', name: 'カットアップ加工', priceText: '2,000円', quantity: index === 1 ? 6 : 1 }] : index >= 5 ? [{ id: 'live', name: 'ライブ用音源制作', priceText: '1,000円', quantity: 1 }] : [];
    const optionTotal = options.reduce((sum, option) => sum + Number(option.priceText.match(/[0-9,]+/)[0].replaceAll(',', '')) * option.quantity, 0), normalTotal = plan.price + optionTotal;
    const id = `qa-estimate-order-${index}`;
    receipts.push({ entityId: id, quote: { plan: { id: plan.id, name: plan.name, price: plan.price }, options, hasConsultation: false, basePrice: 8000, optionPrice: Math.floor(normalTotal * .8) - 8000, price: Math.floor(normalTotal * .8), autumnSale: { name: 'ブラックフライデーMIXセール', discount: 20, normalTotal } } });
    return { id, clientName: 'ポ村ころりぃ', clientEmail: 'estimate-fixture@example.invalid', customerType: 'PERSONAL', companyName: null, serviceType: 'MIX', planId: plan.name, songTitle, options: options.map(option => option.name).join(', '), basePrice: 8000, optionPrice: Math.floor(normalTotal * .8) - 8000, price: Math.floor(normalTotal * .8), createdAt: new Date('2026-11-24T10:00:00+09:00'), isTest: false };
  });
  return { orders, plans, receipts };
}
