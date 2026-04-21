import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

export const DELETE = withLogging(async (request) => container.notificationsController.deleteAll(request));
