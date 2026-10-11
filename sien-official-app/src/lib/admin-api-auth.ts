import { isAdmin } from "@/lib/auth";

export async function isAdminRequest(request: Request) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const expected = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.sien-official.com";
    let origin: string;
    try { origin = new URL(expected).origin; } catch { return false; }
    // Cookie-authenticated writes require the site's origin, including writes
    // from another subdomain that would otherwise share SameSite cookies.
    if (request.headers.get("origin") !== origin) return false;
  }
  return isAdmin();
}
