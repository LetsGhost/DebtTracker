import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie } from "@/backend/common/auth/auth";
import { withLogging } from "@/backend/common/logging/logging-middleware";

export const POST = withLogging(async (request: NextRequest) => {
  const loginUrl = new URL("/login", request.nextUrl.origin);
  const response = NextResponse.redirect(loginUrl, { status: 303 });
  clearAuthCookie(response);
  return response;
});
