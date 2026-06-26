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
      status, price, deadline, 
      serviceType, planId, songTitle, vocalKey, options, message,
      clientName, clientEmail, twitterId
    } = body;

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (price !== undefined) dataToUpdate.price = price;
    if (deadline !== undefined) dataToUpdate.deadline = deadline;
    if (serviceType !== undefined) dataToUpdate.serviceType = serviceType;
    if (planId !== undefined) dataToUpdate.planId = planId;
    if (songTitle !== undefined) dataToUpdate.songTitle = songTitle;
    if (vocalKey !== undefined) dataToUpdate.vocalKey = vocalKey;
    if (options !== undefined) dataToUpdate.options = options;
    if (message !== undefined) dataToUpdate.message = message;
    if (clientName !== undefined) dataToUpdate.clientName = clientName;
    if (clientEmail !== undefined) dataToUpdate.clientEmail = clientEmail;
    if (twitterId !== undefined) dataToUpdate.twitterId = twitterId;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    // クライアント情報が更新される場合、または status が変更された場合、リピーター判定を再計算
    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (currentOrder) {
      const newEmail = clientEmail !== undefined ? clientEmail : currentOrder.clientEmail;
      const newTwitterId = twitterId !== undefined ? twitterId : currentOrder.twitterId;
      const newName = clientName !== undefined ? clientName : currentOrder.clientName;
      
      const { checkIsRepeater } = await import("@/lib/repeater");
      dataToUpdate.isRepeater = await checkIsRepeater(newEmail, newTwitterId, newName, id);
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
