import { NextRequest } from "next/server";

import { withLogging } from "@/backend/common/logging/logging-middleware";
import { getUserIdFromRequest } from "@/backend/common/auth/request-auth";
import { fail } from "@/backend/common/http/response";
import { container } from "@/backend/container";

export const GET = withLogging(async (request: NextRequest) => {
  try {
    const userId = getUserIdFromRequest(request);
    return container.transactionsController.list(request, userId);
  } catch {
    return fail("Unauthorized", 401);
  }
});
