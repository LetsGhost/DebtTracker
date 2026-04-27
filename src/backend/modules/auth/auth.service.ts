import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { env } from "@/backend/common/config/env";
import { ApiError } from "@/backend/common/errors/errors";
import { signAccessToken, verifyAccessToken } from "@/backend/common/auth/auth";
import { logger } from "@/backend/common/logging/logger";
import { emailTokenService } from "@/backend/common/email/email.tokens";
import { emailWorkflowService } from "@/backend/common/email/email.flows";
import { AuthLoginAuditModel } from "@/backend/modules/auth/auth-login-audit.entity";
import { UsersService } from "@/backend/modules/users/users.service";

export class AuthService {
  private static readonly RESEND_VERIFICATION_COOLDOWN_MS = 60_000;

  constructor(private readonly usersService: UsersService) {}

  private async recordLoginAttempt(input: {
    userId?: string;
    email: string;
    success: boolean;
    failureReason?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await AuthLoginAuditModel.create(input);
    } catch (error) {
      logger.warn("Failed to write login audit", { email: input.email, error });
    }
  }

  async register(input: { email: string; password: string; displayName: string }) {
    logger.info("User registration attempt", { email: input.email });
    const user = await this.usersService.createUser(input);

    void emailWorkflowService
      .sendEmailVerificationEmail(user)
      .then(async () => {
        await this.usersService.touchVerificationEmailSent(user.id);
      })
      .catch((error) => {
        logger.warn("Failed to send verification email", {
          userId: user.id,
          email: user.email,
          error,
        });
      });
    logger.info("User registered successfully", { userId: user.id, email: user.email });
    return user;
  }

  async login(input: { email: string; password: string }, request?: NextRequest) {
    logger.debug("Login attempt", { email: input.email });
    const email = input.email.toLowerCase();
    const ipAddress = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request?.headers.get("x-real-ip") || undefined;
    const userAgent = request?.headers.get("user-agent") || undefined;

    try {
      const user = await this.usersService.verifyPassword(input.email, input.password);

      if (user.suspendedAt) {
        throw new ApiError("Account is suspended", 403);
      }

      if (!user.emailVerifiedAt) {
        throw new ApiError("Please verify your email before logging in", 403);
      }

      const token = signAccessToken(user.id, true);
      await this.usersService.touchLastLogin(user.id);
      await this.recordLoginAttempt({
        userId: user.id,
        email,
        success: true,
        ipAddress,
        userAgent,
      });
      logger.info("User logged in", { userId: user.id });
      return { user, token };
    } catch (error) {
      await this.recordLoginAttempt({
        email,
        success: false,
        failureReason: error instanceof Error ? error.message : "unknown",
        ipAddress,
        userAgent,
      });
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

    if (!payload.verified) {
      throw new ApiError("Please verify your email before using the app", 403);
    }

    const user = await this.usersService.getById(payload.userId);

    if (user.suspendedAt) {
      logger.warn("Suspended user attempted authenticated access", { userId: user.id, email: user.email });
      throw new ApiError("Account is suspended", 403);
    }

    return user;
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

  async resendVerificationEmail(input: { email: string }) {
    const user = await this.usersService.getByEmail(input.email);

    if (!user) {
      logger.info("Verification resend requested for unknown email", { email: input.email.toLowerCase() });
      return { emailSent: true };
    }

    if (user.emailVerifiedAt) {
      return { emailSent: true };
    }

    const nowMs = Date.now();
    const lastSentMs = user.emailVerificationLastSentAt ? new Date(user.emailVerificationLastSentAt).getTime() : 0;
    const elapsed = nowMs - lastSentMs;

    if (elapsed < AuthService.RESEND_VERIFICATION_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((AuthService.RESEND_VERIFICATION_COOLDOWN_MS - elapsed) / 1000);
      throw new ApiError(`Please wait ${waitSeconds}s before requesting another verification email`, 429);
    }

    await emailWorkflowService.sendEmailVerificationEmail(user);
    await this.usersService.touchVerificationEmailSent(user.id);
    logger.info("Verification email resent", { userId: user.id, email: user.email });
    return { emailSent: true };
  }
}
