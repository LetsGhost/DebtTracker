const required = ["MONGODB_URI", "JWT_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "FinancTracker",
  mongodbUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  jwtCookieName: process.env.JWT_COOKIE_NAME ?? "ft_token",
  nodeEnv: process.env.NODE_ENV ?? "development",
  sysAdminEmails: (process.env.SYS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean),
};
