import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie } from "@/backend/common/auth/auth";
import { withLogging } from "@/backend/common/logging/logging-middleware";

export const POST = withLogging(async (request: NextRequest) => {
  // Use the incoming request URL as base so reverse proxies or forwarded
  // hosts are respected. `request.nextUrl.origin` can be incorrect in some
  // environments (e.g. when host headers are rewritten), causing redirects
  // back to localhost. `request.url` preserves the original request.
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl.toString(), { status: 303 });
  clearAuthCookie(response);
  return response;
});
