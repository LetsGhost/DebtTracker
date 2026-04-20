import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ threadId: string }> };

export const POST = withLogging(async (request, context?: Context) => {
  const { threadId } = await (context as Context).params;
  return container.p2pController.addExpense(request, threadId);
}) as never;
