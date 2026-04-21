import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

export const POST = withLogging(async (request: NextRequest) => {
  container.authController.logout();
  const loginUrl = new URL("/login", request.nextUrl.origin);
  return NextResponse.redirect(loginUrl, { status: 302 });
});
