import type { BusinessContact } from "@prisma/client";

// The source row stays unchanged. Classification of historical tests is explicit by ID.
export function businessOrderData(contact: BusinessContact, isTest = false) {
  return {
    businessContactId: contact.id,
    customerType: "BUSINESS",
    companyName: contact.companyName,
    clientName: contact.contactName,
    clientEmail: contact.email,
    contactMethod: "EMAIL",
    serviceType: contact.inquiryType.includes("MIX") ? "MIX" : contact.inquiryType.includes("楽曲制作") ? "ORIGINAL" : "BUSINESS",
    songTitle: contact.inquiryType,
    deadline: contact.deadline,
    message: contact.message,
    status: contact.status === "CANCELLED" ? "CANCELED" : contact.status,
    price: contact.estimatedPrice,
    confirmedPrice: contact.finalPrice,
    // No payment or revenue date is inferred from a status or an invoice date.
    isTest,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}
