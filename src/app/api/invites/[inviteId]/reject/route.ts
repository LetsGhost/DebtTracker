import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ inviteId: string }> };

export const POST = withLogging(async (request, context?: Context) => {
  const { inviteId } = await (context as Context).params;
  return container.groupsController.rejectInvite(request, inviteId);
}) as never;
