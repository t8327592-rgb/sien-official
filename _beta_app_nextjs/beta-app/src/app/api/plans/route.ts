import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
  const plans = await prisma.plan.findMany({
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const newPlan = await prisma.plan.create({
      data: {
        title: body.title,
        price: body.price,
        description: body.description,
        period: body.period,
        revisions: body.revisions,
        isPopular: body.isPopular || false,
        order: body.order || 0,
      },
    });
    revalidatePath("/", "layout");
    return NextResponse.json(newPlan);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const updatedPlan = await prisma.plan.update({
      where: { id: body.id },
      data: {
        title: body.title,
        price: body.price,
        description: body.description,
        period: body.period,
        revisions: body.revisions,
        isPopular: body.isPopular,
        order: body.order,
      },
    });
    revalidatePath("/", "layout");
    return NextResponse.json(updatedPlan);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return new NextResponse("Bad Request", { status: 400 });

    await prisma.plan.delete({
      where: { id },
    });
    revalidatePath("/", "layout");
    return new NextResponse("OK");
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
