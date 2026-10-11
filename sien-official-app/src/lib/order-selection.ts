export type OrderService = "MIX" | "ORIGINAL" | "GUIDE";
export interface OrderPlan {
  id: string;
  name: string;
  category: string;
  price: number | null;
}

export function resolveOrderSelection(plans: OrderPlan[], planId?: string, service?: string) {
  const selected = plans.find(plan => plan.id === planId && ["MIX", "ORIGINAL", "GUIDE"].includes(plan.category));
  const requested = selected?.category || service;
  const serviceType: OrderService = requested === "ORIGINAL" ? "ORIGINAL" : requested === "GUIDE" ? "GUIDE" : "MIX";
  return {
    serviceType,
    planId: selected?.id ?? plans.find(plan => plan.category === serviceType)?.id ?? "",
    selectionNotice: planId && !selected ? "選択したプランは現在利用できません。表示中のプランから選び直してください。" : "",
  };
}
