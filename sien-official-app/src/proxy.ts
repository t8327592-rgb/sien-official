import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = process.env.NEXTAUTH_SECRET ? await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }) : null;
  if (token?.email === "admin@sien-official.com") return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/admin")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const login = new URL("/login", request.url);
  login.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
