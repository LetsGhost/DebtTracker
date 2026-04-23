import { Resend } from "resend";
import React from "react";

import { ApiError } from "@/backend/common/errors/errors";
import { env } from "@/backend/common/config/env";
import { logger } from "@/backend/common/logging/logger";
import {
  EmailVerificationTemplate,
  NotificationEmailTemplate,
  PasswordResetEmailTemplate,
} from "@/backend/common/email/email.templates";

type MailPayload = {
  to: string | string[];
  subject: string;
  react: React.ReactNode;
  replyTo?: string;
};

type PasswordResetEmailInput = {
  to: string;
  firstName?: string;
  resetUrl: string;
};

type EmailVerificationInput = {
  to: string;
  firstName?: string;
  verificationUrl: string;
};

type NotificationEmailInput = {
  to: string;
  firstName?: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export class EmailService {
  private client: Resend | null = null;

  private getClient() {
    if (!env.resendApiKey) {
      throw new ApiError("RESEND_API_KEY is not configured", 500);
    }

    if (!this.client) {
      this.client = new Resend(env.resendApiKey);
    }

    return this.client;
  }

  private getFromAddress() {
    if (!env.emailFrom) {
      throw new ApiError("EMAIL_FROM is not configured", 500);
    }

    return env.emailFrom;
  }

  private async sendMail(payload: MailPayload) {
    const resend = this.getClient();
    const { data, error } = await resend.emails.send({
      from: this.getFromAddress(),
      to: payload.to,
      subject: payload.subject,
      react: payload.react,
      replyTo: env.emailReplyTo,
    });

    if (error) {
      logger.error("Failed to send email", {
        subject: payload.subject,
        to: payload.to,
        reason: error,
      });
      throw new ApiError("Failed to send email", 502);
    }

    logger.info("Email sent", {
      subject: payload.subject,
      to: payload.to,
      id: data?.id,
    });

    return data;
  }

  async sendPasswordResetEmail(input: PasswordResetEmailInput) {
    return this.sendMail({
      to: input.to,
      subject: "Passwort zuruecksetzen",
      react: React.createElement(PasswordResetEmailTemplate, {
        appName: env.appName,
        firstName: input.firstName,
        resetUrl: input.resetUrl,
      }),
    });
  }

  async sendEmailVerification(input: EmailVerificationInput) {
    return this.sendMail({
      to: input.to,
      subject: "E-Mail bestaetigen",
      react: React.createElement(EmailVerificationTemplate, {
        appName: env.appName,
        firstName: input.firstName,
        verificationUrl: input.verificationUrl,
      }),
    });
  }

  async sendNotificationEmail(input: NotificationEmailInput) {
    return this.sendMail({
      to: input.to,
      subject: `${env.appName}: neue Benachrichtigung`,
      react: React.createElement(NotificationEmailTemplate, {
        appName: env.appName,
        firstName: input.firstName,
        message: input.message,
        ctaLabel: input.ctaLabel,
        ctaUrl: input.ctaUrl,
      }),
    });
  }
}

export const emailService = new EmailService();