import { isAdminRequest } from "@/lib/admin-api-auth";
import { loadSalesData } from "@/lib/sales-data";
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await loadSalesData(), { headers: { "Cache-Control": "no-store" } });
}
