import { logger } from "@/backend/common/logging/logger";
import { NextResponse } from "next/server";
import { env } from "@/backend/common/config/env";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const fail = (message: string, status = 400, error?: unknown) => {
  const logMethod = status >= 500 ? logger.error : logger.warn;
  logMethod(message, {
    status,
    error,
  });

  const body: any = { success: false, error: message };
  if (env.nodeEnv !== "production" && error) {
    // Include lightweight debug info in non-production environments
    body.debug = typeof error === "string" ? error : (error as any)?.message ?? String(error);
  }

  return NextResponse.json(body, { status });
};
