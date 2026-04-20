import { withLogging } from "@/backend/common/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ groupId: string }> };

export const GET = withLogging(async (request, context?: Context) => {
  const { groupId } = await (context as Context).params;
  return container.settlementsController.list(request, groupId);
}) as never;

export const POST = withLogging(async (request, context?: Context) => {
  const { groupId } = await (context as Context).params;
  return container.settlementsController.create(request, groupId);
}) as never;
