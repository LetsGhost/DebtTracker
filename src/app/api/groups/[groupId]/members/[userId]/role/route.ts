import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ groupId: string; userId: string }> };

export const PATCH = withLogging(async (request, context?: Context) => {
  const { groupId, userId } = await (context as Context).params;
  return container.groupsController.updateRole(request, groupId, userId);
}) as never;
