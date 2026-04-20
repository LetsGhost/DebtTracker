import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ groupId: string }> };

export const POST = withLogging(async (request, context?: Context) => {
  const { groupId } = await (context as Context).params;
  return container.groupsController.leaveGroup(request, groupId);
}) as never;
