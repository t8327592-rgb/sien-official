import { requireAdminPage } from "@/lib/admin-page-auth";
import { loadSalesData } from "@/lib/sales-data";
import { SalesDashboard } from "@/components/admin/sales/SalesDashboard";

export const dynamic = "force-dynamic";
export default async function SalesPage() {
  await requireAdminPage();
  return <SalesDashboard data={await loadSalesData()} />;
}
