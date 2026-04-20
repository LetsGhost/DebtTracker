import { withLogging } from "@/backend/common/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ groupId: string }> };

export const GET = withLogging(async (request, context?: Context) => {
  const { groupId } = await (context as Context).params;
  return container.groupsController.getGroup(request, groupId);
}) as never;

export const DELETE = withLogging(async (request, context?: Context) => {
  const { groupId } = await (context as Context).params;
  return container.groupsController.deleteGroup(request, groupId);
}) as never;
