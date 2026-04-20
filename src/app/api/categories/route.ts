import { NextRequest } from "next/server";

import { withLogging } from "@/backend/common/logging-middleware";
import { getUserIdFromRequest } from "@/backend/common/request-auth";
import { fail } from "@/backend/common/response";
import { container } from "@/backend/container";

export const GET = withLogging(async (request: NextRequest) => {
  try {
    const userId = getUserIdFromRequest(request);
    return container.categoriesController.list(request, userId);
  } catch {
    return fail("Unauthorized", 401);
  }
});
