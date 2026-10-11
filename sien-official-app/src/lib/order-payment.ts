export const PAYMENT_METHODS = ["銀行振込", "クレジットカード", "その他"] as const;
export const ADMIN_PAYMENT_OPTIONS = [
  ...PAYMENT_METHODS.map(value => ({ value, label: value })),
  { value: "PayPay", label: "PayPay（旧データ）" },
];
const LEGACY_PAYMENT_METHODS: Record<string, string> = {
  bank_transfer: "銀行振込",
  credit_card: "クレジットカード",
  paypay: "PayPay",
};
export function normalizePaymentMethod(value: string) {
  return LEGACY_PAYMENT_METHODS[value] ?? value;
}
