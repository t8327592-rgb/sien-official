import type { Order, Plan, SubmissionReceipt } from "@prisma/client";
import { calculateOrderPrice, priceFromText } from "./order-pricing";
import { autumnSale, isAutumnMixSale } from "../config/autumn-sale";
import { japanDay, type EstimateContent, type EstimateLine } from "./estimates";

type ReceiptQuote = { plan?: { name?: string; price?: number | null }; options?: { id: string; name: string; priceText: string; quantity?: number }[]; hasConsultation?: boolean; autumnSale?: { name: string; discount: number; normalTotal?: number | null } };
export function createEstimateDraft(orders: Order[], plans: Plan[], receipts: Pick<SubmissionReceipt, "entityId" | "quote">[], number: string, now = new Date()) {
  const lines: EstimateLine[] = [], saleLines: string[] = [], warnings: string[] = [];
  for (const order of orders) {
    const snapshot = receipts.find(receipt => receipt.entityId === order.id)?.quote as ReceiptQuote | undefined;
    const plan = plans.find(plan => (plan.id === order.planId || plan.name === order.planId) && plan.category === order.serviceType);
    const baseId = `${order.id}-base`, songTitle = order.songTitle || "楽曲名未設定";
    let basePrice = order.basePrice ?? (order.price !== null ? Math.max(0, order.price - (order.optionPrice ?? 0)) : plan?.price ?? 0);
    const options: EstimateLine[] = [];
    if (snapshot?.plan && typeof snapshot.plan.price === "number" && Array.isArray(snapshot.options)) {
      basePrice = snapshot.plan.price;
      const quantities = Object.fromEntries(snapshot.options.map(option => [option.id, option.quantity ?? 1]));
      const normal = calculateOrderPrice({ price: basePrice }, snapshot.options, quantities);
      let optionSum = 0;
      snapshot.options.forEach((option, index) => {
        const quantity = option.name.includes("カットアップ") ? quantities[option.id] : 1;
        const price = option.priceText.includes("要相談") ? 0 : priceFromText(option.priceText) ?? 0;
        // Encoding uses the pre-encoding subtotal in the existing calculator.
        if (option.name.includes("エンコード")) return;
        optionSum += price * quantity;
        options.push({ id: `${order.id}-option-${index}`, orderId: order.id, kind: "OPTION", songTitle, name: option.name, quantity, unitPrice: price, note: /[〜～~]|要相談/.test(option.priceText) ? "要確認：料金は目安です。" : "" });
      });
      if (snapshot.options.some(option => option.name.includes("エンコード"))) options.push({ id: `${order.id}-encode`, orderId: order.id, kind: "OPTION", songTitle, name: "エンコード", quantity: 1, unitPrice: normal.optionPrice - optionSum, note: "" });
      if (snapshot.hasConsultation || normal.hasConsultation) warnings.push(`${songTitle}：相談料金を確認し、単価を確定してください。`);
      if (snapshot.autumnSale?.discount === autumnSale.discount && isAutumnMixSale(order.serviceType, order.createdAt.getTime()) && !snapshot.hasConsultation && !normal.hasConsultation && snapshot.autumnSale.normalTotal === normal.total) saleLines.push(baseId, ...options.map(line => line.id));
      if (order.price !== null && order.price !== (snapshot.autumnSale ? Math.floor(normal.total * (100 - snapshot.autumnSale.discount) / 100) : normal.total)) warnings.push(`${songTitle}：現在の依頼見積額と受付時の明細に差があります。明細を確認してください。`);
    } else {
      // Legacy rows may already contain discounts. Never reverse or reapply them.
      if (order.options || order.optionPrice) options.push({ id: `${order.id}-legacy-options`, orderId: order.id, kind: "OPTION", songTitle, name: (order.options || "オプション料金").slice(0, 150), quantity: 1, unitPrice: order.optionPrice ?? 0, note: "保存済みの合算額。必要に応じて明細を分割してください。" });
      warnings.push(`${songTitle}：受付時の料金明細がないため、保存済み金額を使用しています。プラン・オプションと割引の適用状況を確認してください。`);
    }
    lines.push({ id: baseId, orderId: order.id, kind: "BASE", songTitle, name: snapshot?.plan?.name || plan?.name || order.planId || order.serviceType, quantity: 1, unitPrice: basePrice, note: "" }, ...options);
  }
  const content: EstimateContent = {
    clientName: orders[0].companyName || orders[0].clientName, number, issuedOn: japanDay(now), validUntil: japanDay(new Date(now.getTime() + 30 * 86400000)), lines,
    discount: { name: saleLines.length ? autumnSale.name : "", mode: "PERCENT", value: saleLines.length ? autumnSale.discount : 0, target: saleLines.length === lines.length ? "ALL" : "SELECTED", lineIds: saleLines },
    notes: "", paymentGuide: "お支払い方法・時期は、ご案内した内容をご確認ください。", message: "",
  };
  if (saleLines.length && saleLines.length !== lines.length) warnings.push("セール対象の依頼明細だけに割引を設定しました。対象を確認してください。");
  return { content, warnings };
}
