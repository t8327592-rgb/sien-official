import type { Prisma } from "@prisma/client";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJson, ApiError, apiErrorResponse } from "@/lib/api-input";
import { validateAdminOrderUpdate, reconcileAdminOrderPrice } from "@/lib/admin-order-input";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {

    const { id } = await params;
    const update = validateAdminOrderUpdate(await readJson(request));
    const { status, clientEmail, twitterId, clientName, isRepeater } = update;

    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    reconcileAdminOrderPrice(update, currentOrder);
    const dataToUpdate: Prisma.OrderUpdateManyMutationInput = { ...update };
    if (isRepeater === undefined) {
      const emailChanged = clientEmail !== undefined && clientEmail !== currentOrder.clientEmail;
      const twitterChanged = twitterId !== undefined && twitterId !== currentOrder.twitterId;
      const nameChanged = clientName !== undefined && clientName !== currentOrder.clientName;

      // クライアント情報が変更された場合のみ、リピーター判定を再計算
      if (emailChanged || twitterChanged || nameChanged) {
        const newEmail = clientEmail !== undefined ? clientEmail : currentOrder.clientEmail;
        const newTwitterId = twitterId !== undefined ? twitterId : currentOrder.twitterId;
        const newName = clientName !== undefined ? clientName : currentOrder.clientName;

        const { checkIsRepeater } = await import("@/lib/repeater");
        dataToUpdate.isRepeater = await checkIsRepeater(newEmail, newTwitterId, newName, id, currentOrder.createdAt);
      }
    }

    if (status === "COMPLETED" && currentOrder?.status !== "COMPLETED") {
      if (!currentOrder?.deliveredAt) {
        dataToUpdate.deliveredAt = new Date();
      }
    }

    const updated = await prisma.order.updateMany({
      where: { id, updatedAt: currentOrder.updatedAt },
      data: dataToUpdate,
    });
    if (!updated.count) throw new ApiError(409, "別の更新がありました。ページを再読み込みしてから、もう一度保存してください。");
    const updatedOrder = await prisma.order.findUnique({ where: { id } });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Failed to update order");
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {

    const { id } = await params;

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json({ success: false, error: "Failed to delete order" }, { status: 500 });
  }
}
