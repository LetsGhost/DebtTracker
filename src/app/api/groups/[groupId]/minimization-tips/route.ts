import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ groupId: string }> };

export const GET = withLogging(async (request, context?: Context) => {
  const { groupId } = await (context as Context).params;
  return container.minimizationController.tips(request, groupId);
}) as never;
