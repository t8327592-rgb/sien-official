import { isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
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
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;

    await prisma.businessContact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete business contact:", error);
    return NextResponse.json(
      { error: "Failed to delete business contact" },
      { status: 500 }
    );
  }
}
