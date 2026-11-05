import { isAdminRequest } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";
import { readJson, apiErrorResponse } from "@/lib/api-input";
import { validateExpense } from "@/lib/admin-content-input";
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = validateExpense(await readJson(request));
    return Response.json(await prisma.expense.create({ data }), { status: 201 });
  } catch (error) { return apiErrorResponse(error) ?? Response.json({ error: "経費を保存できませんでした。" }, { status: 500 }); }
}
