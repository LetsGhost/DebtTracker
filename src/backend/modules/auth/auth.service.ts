import { cookies } from "next/headers";

import { env } from "@/backend/common/config/env";
import { ApiError } from "@/backend/common/errors/errors";
import { signAccessToken, verifyAccessToken } from "@/backend/common/auth/auth";
import { logger } from "@/backend/common/logging/logger";
import { emailTokenService } from "@/backend/common/email/email.tokens";
import { emailWorkflowService } from "@/backend/common/email/email.flows";
import { UsersService } from "@/backend/modules/users/users.service";

export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(input: { email: string; password: string; displayName: string }) {
    logger.info("User registration attempt", { email: input.email });
    const user = await this.usersService.createUser(input);
    const token = signAccessToken(user.id);
    void emailWorkflowService.sendEmailVerificationEmail(user).catch((error) => {
      logger.warn("Failed to send verification email", {
        userId: user.id,
        email: user.email,
        error,
      });
    });
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
      logger.warn("Failed login attempt", { email: input.email, error });
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

  async requestPasswordReset(input: { email: string }) {
    const user = await this.usersService.getByEmail(input.email);

    if (!user) {
      logger.info("Password reset requested for unknown email", { email: input.email });
      return { emailSent: true };
    }

    await emailWorkflowService.sendPasswordResetEmail(user);
    logger.info("Password reset email queued", { userId: user.id, email: user.email });
    return { emailSent: true };
  }

  async resetPassword(input: { token: string; password: string }) {
    const claims = emailTokenService.verifyToken(input.token, "password-reset");
    const updatedUser = await this.usersService.updatePassword(claims.userId, input.password);
    logger.info("Password reset completed", { userId: updatedUser.id, email: updatedUser.email });
    return { reset: true };
  }

  async verifyEmail(input: { token: string }) {
    const claims = emailTokenService.verifyToken(input.token, "email-verification");
    const updatedUser = await this.usersService.markEmailVerified(claims.userId);
    logger.info("Email verified", { userId: updatedUser.id, email: updatedUser.email });
    return { verified: true };
  }
}
