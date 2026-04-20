import { withLogging } from "@/backend/common/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ groupId: string; userId: string }> };

export const DELETE = withLogging(async (request, context?: Context) => {
  const { groupId, userId } = await (context as Context).params;
  return container.groupsController.removeMember(request, groupId, userId);
}) as never;
