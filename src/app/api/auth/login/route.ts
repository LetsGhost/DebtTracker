import { withLogging } from "@/backend/common/logging-middleware";
import { container } from "@/backend/container";

export const POST = withLogging(async (request) =>
  container.authController.login(request)
);
