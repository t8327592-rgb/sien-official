import { saleConfirmationKind } from "@/config/autumn-sale";

// Retain these kinds for history, but never send or retry customer emails.
export const disabledClientEmailKinds = ["ORDER_RECEIPT_EMAIL", "BUSINESS_RECEIPT_EMAIL", saleConfirmationKind];

export function isClientEmailNotification(kind: string) {
  return kind.endsWith("_RECEIPT_EMAIL") || disabledClientEmailKinds.includes(kind);
}
