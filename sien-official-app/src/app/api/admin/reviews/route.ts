import { invalidatePublicContent } from "@/lib/public-cache";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {

    const reviews = await prisma.review.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {

    const body = await request.json();
    const { name, serviceType, content, rating, isPublished, orderIndex } = body;

    const review = await prisma.review.create({
      data: {
        name,
        serviceType,
        content,
        rating: rating || 5,
        isPublished: isPublished ?? true,
        orderIndex: orderIndex || 0,
      },
    });

    invalidatePublicContent("reviews");

    return NextResponse.json(review);
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
