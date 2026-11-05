import { validatePostContent } from "@/lib/admin-post-input";
import { readJson, apiErrorResponse } from "@/lib/api-input";
import { invalidatePublicContent } from "@/lib/public-cache";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson(req, 600000);
    const data = validatePostContent({ ...body, type: body.type ?? "BLOG" });
    const post = await prisma.post.create({ data });

    invalidatePublicContent("blog", "news");

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "記事の作成に失敗しました" },
      { status: 500 }
    );
  }
}
