import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const profile = await prisma.profile.findUnique({
    where: { id: "main-profile" },
  });
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const updatedProfile = await prisma.profile.update({
      where: { id: "main-profile" },
      data: {
        name: body.name,
        title: body.title,
        twitterId: body.twitterId,
        text1: body.text1,
        text2: body.text2,
        text3: body.text3,
        availability: body.availability,
        deliveryInfo: body.deliveryInfo,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Profile update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
