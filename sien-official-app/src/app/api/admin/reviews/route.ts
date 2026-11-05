import { validateReview } from "@/lib/admin-content-input";
import { readJson, apiErrorResponse } from "@/lib/api-input";
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

    const data = validateReview(await readJson(request));
    const review = await prisma.review.create({ data });

    invalidatePublicContent("reviews");

    return NextResponse.json(review);
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
