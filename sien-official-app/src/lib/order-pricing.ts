type PricedOption = { name: string; priceText: string };

// Shared by the preview and server; the server supplies database records only.
export function calculateOrderPrice(plan: { price: number | null }, options: PricedOption[]) {
  const basePrice = plan.price ?? 0;
  let optionPrice = 0;
  let hasConsultation = plan.price === null;
  for (const option of options.filter(o => !o.name.includes("エンコード"))) {
    if (option.priceText.includes("要相談")) { hasConsultation = true; continue; }
    const amount = option.priceText.match(/[0-9,]+/);
    if (amount) optionPrice += Number(amount[0].replace(/,/g, ""));
    else if (!option.priceText.includes("無料")) hasConsultation = true;
    if (/[〜～~]/.test(option.priceText)) hasConsultation = true;
  }
  if (options.some(o => o.name.includes("エンコード")) && basePrice + optionPrice < 10000) optionPrice += 1000;
  return { basePrice, optionPrice, total: basePrice + optionPrice, hasConsultation };
}
