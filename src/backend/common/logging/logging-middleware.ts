import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/backend/common/logging/logger";

export const withLogging = <TContext = unknown>(
  handler: (req: NextRequest, context?: TContext) => Promise<NextResponse>,
) => {
  return async (request: NextRequest, context: TContext) => {
    const requestId = uuidv4();
    const method = request.method;
    const pathname = new URL(request.url).pathname;

    const startTime = Date.now();
    let response: NextResponse;

    try {
      response = await handler(request, context);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        `✗ ${method} ${pathname}`,
        {
          requestId,
          duration,
          error,
        },
      );
      response = NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    }

    response.headers.set("x-request-id", requestId);
    return response;
  };
};
