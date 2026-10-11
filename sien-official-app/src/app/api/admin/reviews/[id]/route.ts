import { invalidatePublicContent } from "@/lib/public-cache";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {

    const { id } = await params;
    const body = await request.json();
    const { name, serviceType, content, rating, isPublished, orderIndex } = body;

    const review = await prisma.review.update({
      where: { id },
      data: {
        name,
        serviceType,
        content,
        rating,
        isPublished,
        orderIndex,
      },
    });

    invalidatePublicContent("reviews");

    return NextResponse.json(review);
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {

    const { id } = await params;

    await prisma.review.delete({
      where: { id },
    });

    invalidatePublicContent("reviews");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
