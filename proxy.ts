import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isAuthPage = req.nextUrl.pathname.startsWith("/admin/login");
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

  if (isAdminPage && !isAuthPage) {
    if (!token) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", encodeURI(req.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
