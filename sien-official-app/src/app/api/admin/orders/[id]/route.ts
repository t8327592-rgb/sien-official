import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      status, price, basePrice, optionPrice, paymentMethod, deadline, 
      serviceType, planId, songTitle, vocalKey, genre, lyricsStatus, vocalGuideStatus, referenceFidelity, options, message,
      clientName, clientEmail, twitterId, isRepeater, isArchived
    } = body;

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (price !== undefined) dataToUpdate.price = price;
    if (basePrice !== undefined) dataToUpdate.basePrice = basePrice;
    if (optionPrice !== undefined) dataToUpdate.optionPrice = optionPrice;
    if (paymentMethod !== undefined) dataToUpdate.paymentMethod = paymentMethod;
    if (deadline !== undefined) dataToUpdate.deadline = deadline;
    if (serviceType !== undefined) dataToUpdate.serviceType = serviceType;
    if (planId !== undefined) dataToUpdate.planId = planId;
    if (songTitle !== undefined) dataToUpdate.songTitle = songTitle;
    if (vocalKey !== undefined) dataToUpdate.vocalKey = vocalKey;
    if (genre !== undefined) dataToUpdate.genre = genre;
    if (lyricsStatus !== undefined) dataToUpdate.lyricsStatus = lyricsStatus;
    if (vocalGuideStatus !== undefined) dataToUpdate.vocalGuideStatus = vocalGuideStatus;
    if (referenceFidelity !== undefined) dataToUpdate.referenceFidelity = referenceFidelity;
    if (options !== undefined) dataToUpdate.options = options;
    if (message !== undefined) dataToUpdate.message = message;
    if (clientName !== undefined) dataToUpdate.clientName = clientName;
    if (clientEmail !== undefined) dataToUpdate.clientEmail = clientEmail;
    if (twitterId !== undefined) dataToUpdate.twitterId = twitterId;
    if (isArchived !== undefined) dataToUpdate.isArchived = isArchived;

    if (Object.keys(dataToUpdate).length === 0 && isRepeater === undefined) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    let currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (isRepeater !== undefined) {
      dataToUpdate.isRepeater = isRepeater === true || isRepeater === 'true';
    } else {
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

    // 自動計算: basePrice または optionPrice が更新された場合、合計金額 (price) も自動で再計算する
    if (price === undefined && (basePrice !== undefined || optionPrice !== undefined)) {
      const newBase = basePrice !== undefined ? basePrice : currentOrder.basePrice;
      const newOption = optionPrice !== undefined ? optionPrice : currentOrder.optionPrice;
      if (newBase !== null || newOption !== null) {
        dataToUpdate.price = (newBase || 0) + (newOption || 0);
      }
    }

    if (status === "COMPLETED" && currentOrder?.status !== "COMPLETED") {
      if (!currentOrder?.deliveredAt) {
        dataToUpdate.deliveredAt = new Date();
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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
