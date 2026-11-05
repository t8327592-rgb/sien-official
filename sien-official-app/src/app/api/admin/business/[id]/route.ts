import { isAdminRequest } from "@/lib/admin-api-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const linked = await prisma.order.findUnique({ where: { businessContactId: id }, select: { id: true } });
    if (linked) return NextResponse.json({ error: "依頼管理から編集してください。元の問い合わせは保管されています。", orderId: linked.id }, { status: 409 });
    const body = await request.json();

    const updatedContact = await prisma.businessContact.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error("Failed to update business contact:", error);
    return NextResponse.json(
      { error: "Failed to update business contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;

    return NextResponse.json({ error: "法人問い合わせは削除できません。依頼管理のアーカイブ・テスト区分をご利用ください。", id }, { status: 409 });
  } catch (error) {
    console.error("Failed to delete business contact:", error);
    return NextResponse.json(
      { error: "Failed to delete business contact" },
      { status: 500 }
    );
  }
}
