type PricedOption = { id?: string; name: string; priceText: string };

export function priceFromText(text: string) {
  const amount = text.match(/[0-9,]+/);
  return amount ? Number(amount[0].replace(/,/g, "")) : text.includes("無料") ? 0 : null;
}

// Shared by the preview and server; the server supplies database records only.
export function calculateOrderPrice(plan: { price: number | null; hasConsultation?: boolean }, options: PricedOption[], quantities: Record<string, number> = {}) {
  const basePrice = plan.price ?? 0;
  let optionPrice = 0;
  let hasConsultation = plan.price === null || !!plan.hasConsultation;
  for (const option of options.filter(o => !o.name.includes("エンコード"))) {
    if (option.priceText.includes("要相談")) { hasConsultation = true; continue; }
    const amount = option.priceText.match(/[0-9,]+/);
    if (amount) optionPrice += Number(amount[0].replace(/,/g, "")) * (option.name.includes("カットアップ") && option.id ? quantities[option.id] ?? 1 : 1);
    else if (!option.priceText.includes("無料")) hasConsultation = true;
    if (/[〜～~]/.test(option.priceText)) hasConsultation = true;
  }
  if (options.some(o => o.name.includes("エンコード")) && basePrice + optionPrice < 10000) optionPrice += 1000;
  return { basePrice, optionPrice, total: basePrice + optionPrice, hasConsultation };
}
