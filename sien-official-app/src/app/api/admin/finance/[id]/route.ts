import { validateExpense } from "@/lib/admin-content-input";
import { apiErrorResponse, readJson } from "@/lib/api-input";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    const updateData = validateExpense(await readJson(request), true);

    const updatedExpense = await prisma.expense.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    await prisma.expense.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
