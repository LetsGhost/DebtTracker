import { NextRequest, NextResponse } from "next/server";

import { verifyAccessToken } from "@/backend/common/auth/auth";
import { env } from "@/backend/common/config/env";

export const proxy = (request: NextRequest) => {
  const token = request.cookies.get(env.jwtCookieName)?.value;
  const payload = verifyAccessToken(token);

  if (!payload?.userId || !payload.verified) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    if (payload?.userId && !payload.verified) {
      loginUrl.searchParams.set("error", "verify-email");
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/friends/:path*",
    "/expenses/:path*",
    "/settlements/:path*",
    "/sys-admin/:path*",
  ],
};
