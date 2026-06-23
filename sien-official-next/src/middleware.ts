import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Check if the route is under /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');
    const url = req.nextUrl;

    // Default credentials: admin / sien2026 (In production, use env vars)
    const USER = process.env.ADMIN_USER || 'admin';
    const PWD = process.env.ADMIN_PASSWORD || 'sien2026';

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      if (user === USER && pwd === PWD) {
        return NextResponse.next();
      }
    }

    // Return 401 and WWW-Authenticate header to trigger browser password prompt
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
