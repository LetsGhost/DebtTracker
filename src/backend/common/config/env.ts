const required = ["MONGODB_URI", "JWT_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "YouOme",
  mongodbUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  logDir: process.env.LOG_DIR ?? (process.env.NODE_ENV === "production" ? "/app/logs" : "logs"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  jwtCookieName: process.env.JWT_COOKIE_NAME ?? "ft_token",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM,
  emailReplyTo: process.env.EMAIL_REPLY_TO,
  emailTokenSecret: process.env.EMAIL_TOKEN_SECRET,
  emailTokenExpiresIn: process.env.EMAIL_TOKEN_EXPIRES_IN ?? "24h",
  nodeEnv: process.env.NODE_ENV ?? "development",
  sysAdminEmails: (process.env.SYS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean),
};
