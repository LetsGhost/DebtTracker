import { NextRequest } from "next/server";

import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

export const GET = withLogging(async (request: NextRequest) => {
  return container.transactionsController.list(request);
});
