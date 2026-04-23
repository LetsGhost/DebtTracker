import { logger } from "@/backend/common/logging/logger";
import { NextResponse } from "next/server";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const fail = (message: string, status = 400, error?: unknown) => {
  const logMethod = status >= 500 ? logger.error : logger.warn;
  logMethod(message, {
    status,
    error,
  });

  return NextResponse.json({ success: false, error: message }, { status });
};
