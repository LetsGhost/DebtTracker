import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

export const POST = withLogging(async () => container.authController.logout());
