import { validateReview } from "@/lib/admin-content-input";
import { readJson, apiErrorResponse } from "@/lib/api-input";
import { invalidatePublicContent } from "@/lib/public-cache";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {

    const { id } = await params;
    const data = validateReview(await readJson(request), true);
    const review = await prisma.review.update({ where: { id }, data });

    invalidatePublicContent("reviews");

    return NextResponse.json(review);
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
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
