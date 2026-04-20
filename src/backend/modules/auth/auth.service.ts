import { cookies } from "next/headers";

import { env } from "@/backend/common/env";
import { ApiError } from "@/backend/common/errors";
import { signAccessToken, verifyAccessToken } from "@/backend/common/auth";
import { logger } from "@/backend/common/logger";
import { UsersService } from "@/backend/modules/users/users.service";

export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(input: { email: string; password: string; displayName: string }) {
    logger.info("User registration attempt", { email: input.email });
    const user = await this.usersService.createUser(input);
    const token = signAccessToken(user.id);
    logger.info("User registered successfully", { userId: user.id, email: user.email });
    return { user, token };
  }

  async login(input: { email: string; password: string }) {
    logger.debug("Login attempt", { email: input.email });
    try {
      const user = await this.usersService.verifyPassword(input.email, input.password);
      const token = signAccessToken(user.id);
      logger.info("User logged in", { userId: user.id });
      return { user, token };
    } catch (error) {
      logger.warn("Failed login attempt", { email: input.email, reason: error instanceof Error ? error.message : "unknown" });
      throw error;
    }
  }

  async me() {
    const token = (await cookies()).get(env.jwtCookieName)?.value;
    const payload = verifyAccessToken(token);

    if (!payload?.userId) {
      logger.warn("Unauthorized access attempt with missing/invalid token");
      throw new ApiError("Unauthorized", 401);
    }

    return this.usersService.getById(payload.userId);
  }
}
