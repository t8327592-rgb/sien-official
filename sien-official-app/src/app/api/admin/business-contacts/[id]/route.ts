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
    const { status } = await request.json();

    const updatedContact = await prisma.businessContact.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, contact: updatedContact });
  } catch (error) {
    console.error("Failed to update business contact:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update business contact" },
      { status: 500 }
    );
  }
}
