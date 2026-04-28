import { NextRequest } from "next/server";

import { verifyAccessToken } from "@/backend/common/auth/auth";
import { env } from "@/backend/common/config/env";
import { ApiError } from "@/backend/common/errors/errors";

export const getUserIdFromRequest = (request: NextRequest): string => {
  const token = request.cookies.get(env.jwtCookieName)?.value;
  const payload = verifyAccessToken(token);

  if (!payload?.userId) {
    throw new ApiError("Unauthorized", 401);
  }

  if (!payload.verified) {
    throw new ApiError("Please verify your email before using the app", 403);
  }

  return payload.userId;
};
