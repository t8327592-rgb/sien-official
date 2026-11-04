import { redirect } from "next/navigation";
import { autumnSale } from "@/config/autumn-sale";

export default function FormerAutumnSaleOrderPage() {
  redirect(autumnSale.orderPath);
}
