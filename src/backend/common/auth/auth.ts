import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { NextResponse } from "next/server";

import { APP_CONSTANTS } from "@/backend/common/config/constants";
import { env } from "@/backend/common/config/env";

type TokenPayload = JwtPayload & {
  userId: string;
  verified: boolean;
};

export const signAccessToken = (userId: string, verified = true) => {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign({ userId, verified }, env.jwtSecret, options);
};

export const verifyAccessToken = (token?: string): TokenPayload | null => {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
};

export const setAuthCookie = (response: NextResponse, token: string) => {
  response.cookies.set(env.jwtCookieName, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: APP_CONSTANTS.tokenCookieSameSite,
    path: APP_CONSTANTS.tokenCookiePath,
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearAuthCookie = (response: NextResponse) => {
  response.cookies.set(env.jwtCookieName, "", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: APP_CONSTANTS.tokenCookieSameSite,
    path: APP_CONSTANTS.tokenCookiePath,
    maxAge: 0,
  });
};
