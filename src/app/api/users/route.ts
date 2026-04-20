import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

export const GET = withLogging(async (request) =>
  container.usersController.list(request)
);

export const POST = withLogging(async (request) =>
  container.usersController.create(request)
);
