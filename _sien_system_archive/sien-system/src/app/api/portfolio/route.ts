import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const works = await prisma.portfolio.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(works);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const work = await prisma.portfolio.create({
      data: {
        title: body.title,
        videoId: body.videoId,
        artist: body.artist,
        tags: body.tags,
        comment: body.comment,
        order: body.order || 0,
      }
    });
    return NextResponse.json(work);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
  }
}
