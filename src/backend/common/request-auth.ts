import { NextRequest } from "next/server";

import { verifyAccessToken } from "@/backend/common/auth";
import { env } from "@/backend/common/env";
import { ApiError } from "@/backend/common/errors";

export const getUserIdFromRequest = (request: NextRequest): string => {
  const token = request.cookies.get(env.jwtCookieName)?.value;
  const payload = verifyAccessToken(token);

  if (!payload?.userId) {
    throw new ApiError("Unauthorized", 401);
  }

  return payload.userId;
};
