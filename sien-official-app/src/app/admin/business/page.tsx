import { requireAdminPage } from "@/lib/admin-page-auth";
import { redirect } from "next/navigation";
export default async function BusinessPage() {
  await requireAdminPage();
  redirect("/admin/orders?customer=BUSINESS");
}
