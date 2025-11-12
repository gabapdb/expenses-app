import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16+ Edge Proxy for route protection
 * - Blocks invalid or missing firebase-auth-token cookies
 * - Rewrites unauthorized users to /unauthorized
 */
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPaths = ["/projects", "/expenses", "/summary", "/dashboard", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  const token = req.cookies.get("firebase-auth-token")?.value;

  // 🚫 Missing or malformed token
  if (isProtected && (!token || token.split(".").length !== 3)) {
    const url = req.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/projects/:path*",
    "/expenses/:path*",
    "/summary/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
