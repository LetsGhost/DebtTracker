import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ notificationId: string }> };

export const POST = withLogging(async (request, context?: Context) => {
  const { notificationId } = await (context as Context).params;
  return container.notificationsController.delete(request, notificationId);
}) as never;
