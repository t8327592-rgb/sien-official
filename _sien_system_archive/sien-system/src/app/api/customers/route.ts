import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  // これはLPのフォームから呼ばれるので認証不要
  try {
    const body = await req.json();
    const newCustomer = await prisma.customer.create({
      data: {
        name: body.name,
        twitterId: body.twitterId,
        email: body.email,
        service: body.service,
        message: body.message,
        status: "未対応",
      },
    });
    return NextResponse.json(newCustomer);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const updatedCustomer = await prisma.customer.update({
      where: { id: body.id },
      data: { 
        status: body.status !== undefined ? body.status : undefined,
        memo: body.memo !== undefined ? body.memo : undefined,
        price: body.price !== undefined ? body.price : undefined,
        deadline: body.deadline !== undefined ? new Date(body.deadline) : undefined,
        tags: body.tags !== undefined ? body.tags : undefined,
        materials: body.materials !== undefined ? body.materials : undefined,
      },
    });
    return NextResponse.json(updatedCustomer);
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

    await prisma.customer.delete({
      where: { id },
    });
    return new NextResponse("OK");
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
