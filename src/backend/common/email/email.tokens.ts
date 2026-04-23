import jwt from "jsonwebtoken";

import { ApiError } from "@/backend/common/errors/errors";
import { env } from "@/backend/common/config/env";

export type EmailTokenPurpose = "password-reset" | "email-verification";

export type EmailTokenClaims = {
  userId: string;
  email: string;
  purpose: EmailTokenPurpose;
};

export class EmailTokenService {
  createToken(
    claims: EmailTokenClaims,
    expiresIn: jwt.SignOptions["expiresIn"] = env.emailTokenExpiresIn as jwt.SignOptions["expiresIn"],
  ) {
    if (!env.emailTokenSecret) {
      throw new ApiError("Email token secret is not configured", 500);
    }

    return jwt.sign(claims, env.emailTokenSecret, { expiresIn });
  }

  verifyToken(token: string, expectedPurpose: EmailTokenPurpose) {
    if (!env.emailTokenSecret) {
      throw new ApiError("Email token secret is not configured", 500);
    }

    try {
      const claims = jwt.verify(token, env.emailTokenSecret) as EmailTokenClaims;

      if (!claims?.userId || !claims?.email || claims.purpose !== expectedPurpose) {
        throw new ApiError("Invalid email token", 400);
      }

      return claims;
    } catch {
      throw new ApiError("Invalid or expired email token", 400);
    }
  }

  createPasswordResetToken(user: { id: string; email: string }) {
    return this.createToken({ userId: user.id, email: user.email, purpose: "password-reset" });
  }

  createEmailVerificationToken(user: { id: string; email: string }) {
    return this.createToken({ userId: user.id, email: user.email, purpose: "email-verification" });
  }
}

export const emailTokenService = new EmailTokenService();