import { isAdminRequest } from "@/lib/admin-api-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJson, apiErrorResponse } from "@/lib/api-input";
import { financeMoney } from "@/lib/order-finance-input";

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await readJson(request);

    if (data.targetMonthlySales === undefined) {
      return NextResponse.json({ error: "Missing targetMonthlySales" }, { status: 400 });
    }

    const targetMonthlySales = financeMoney(data.targetMonthlySales)!;
    const updatedSetting = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {
        targetMonthlySales
      },
      create: {
        id: "default",
        targetMonthlySales
      }
    });

    return NextResponse.json({ targetMonthlySales: updatedSetting.targetMonthlySales });
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Error updating target monthly sales:", error);
    return NextResponse.json(
      { error: "Failed to update target monthly sales" },
      { status: 500 }
    );
  }
}
