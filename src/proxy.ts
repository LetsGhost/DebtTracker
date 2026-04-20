import { NextRequest, NextResponse } from "next/server";

import { env } from "@/backend/common/config/env";

export const proxy = (request: NextRequest) => {
  const token = request.cookies.get(env.jwtCookieName)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/expenses/:path*",
    "/settlements/:path*",
    "/sys-admin/:path*",
  ],
};
