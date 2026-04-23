import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ userId: string }> };

export const PATCH = withLogging(async (request, context?: Context) => {
  const { userId } = await (context as Context).params;
  return container.sysAdminController.setUserSuspension(request, userId);
}) as never;

export const DELETE = withLogging(async (request, context?: Context) => {
  const { userId } = await (context as Context).params;
  return container.sysAdminController.deleteUser(request, userId);
}) as never;
