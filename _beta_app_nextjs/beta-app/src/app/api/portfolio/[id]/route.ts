import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const work = await prisma.portfolio.update({
      where: { id: params.id },
      data: {
        title: body.title,
        videoId: body.videoId,
        artist: body.artist,
        tags: body.tags,
        comment: body.comment,
        order: body.order,
      }
    });
    revalidatePath("/", "layout");
    return NextResponse.json(work);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.portfolio.delete({
      where: { id: params.id }
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete portfolio" }, { status: 500 });
  }
}
