import { buildAppUrl } from "@/backend/common/email/email.urls";
import { emailService } from "@/backend/common/email/email.service";
import { emailTokenService } from "@/backend/common/email/email.tokens";

type UserIdentity = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

const deriveFirstName = (user: UserIdentity) => {
  if (user.firstName?.trim()) {
    return user.firstName.trim();
  }

  const fallback = user.displayName?.trim().split(/\s+/).filter(Boolean)[0];
  return fallback ?? "";
};

export class EmailWorkflowService {
  async sendPasswordResetEmail(user: UserIdentity) {
    const token = emailTokenService.createPasswordResetToken({ id: user.id, email: user.email });
    const resetUrl = buildAppUrl(`/reset-password?token=${encodeURIComponent(token)}`);

    return emailService.sendPasswordResetEmail({
      to: user.email,
      firstName: deriveFirstName(user),
      resetUrl,
    });
  }

  async sendEmailVerificationEmail(user: UserIdentity) {
    const token = emailTokenService.createEmailVerificationToken({ id: user.id, email: user.email });
    const verificationUrl = buildAppUrl(`/verify-email?token=${encodeURIComponent(token)}`);

    return emailService.sendEmailVerification({
      to: user.email,
      firstName: deriveFirstName(user),
      verificationUrl,
    });
  }

  async sendNotificationEmail(user: UserIdentity, message: string, ctaLabel?: string, ctaUrl?: string) {
    return emailService.sendNotificationEmail({
      to: user.email,
      firstName: deriveFirstName(user),
      message,
      ctaLabel,
      ctaUrl,
    });
  }
}

export const emailWorkflowService = new EmailWorkflowService();