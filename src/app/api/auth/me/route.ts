import { withLogging } from "@/backend/common/logging-middleware";
import { container } from "@/backend/container";

export const GET = withLogging(async () => container.authController.me());
