export const autumnSale = {
  name: "2026 AUTUMN MIX SALE",
  path: "/autumn-sale",
  orderPath: "/order?service=MIX",
  enabled: true,
  discount: 20,
  announcementDay: "2026-11-06",
  firstDay: "2026-11-07",
  lastDay: "2026-11-16",
  audioDueDay: "2026-11-29",
} as const;

const japanTime = { timeZone: "Asia/Tokyo" } as const;
const dateFormat = new Intl.DateTimeFormat("ja-JP", { ...japanTime, month: "numeric", day: "numeric" });
const dateWithWeekday = new Intl.DateTimeFormat("ja-JP", { ...japanTime, month: "numeric", day: "numeric", weekday: "short" });

export function saleDay(date: string, weekday = false) {
  return (weekday ? dateWithWeekday : dateFormat).format(new Date(`${date}T00:00:00+09:00`)).replace(/(\d+)\/(\d+)/, "$1月$2日");
}

export const saleStart = Date.parse(`${autumnSale.firstDay}T00:00:00+09:00`);
export const saleAnnouncementStart = Date.parse(`${autumnSale.announcementDay}T00:00:00+09:00`);
export const saleEnd = Date.parse(`${autumnSale.lastDay}T00:00:00+09:00`) + 86_400_000;
export const audioDeadline = `${saleDay(autumnSale.audioDueDay, true)} 23:59`;

export function salePhase(now: number) {
  if (!autumnSale.enabled) return "closed";
  if (now < saleStart) return "upcoming";
  return now < saleEnd ? "open" : "closed";
}

export function isAutumnMixSale(service: string, now: number) {
  return service === "MIX" && salePhase(now) === "open";
}

export function salePrice(normalTotal: number) {
  return Math.floor(normalTotal * (100 - autumnSale.discount) / 100);
}

export const saleConfirmationKind = "ORDER_AUTUMN_SALE_CONFIRMATION";
export const salePolicyVersion = [autumnSale.firstDay, autumnSale.lastDay, autumnSale.audioDueDay, autumnSale.discount].join(":");
