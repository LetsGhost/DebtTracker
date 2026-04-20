import { withLogging } from "@/backend/common/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ threadId: string }> };

export const GET = withLogging(async (request, context?: Context) => {
  const { threadId } = await (context as Context).params;
  return container.p2pController.balances(request, threadId);
}) as never;
