import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ requestId: string }> };

export const POST = withLogging(async (request, context?: Context) => {
  const { requestId } = await (context as Context).params;
  return container.friendsController.rejectRequest(request, requestId);
}) as never;
