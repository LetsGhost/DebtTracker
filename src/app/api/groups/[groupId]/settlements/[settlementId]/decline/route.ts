import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

type Context = { params: Promise<{ settlementId: string }> };

export const POST = withLogging(async (request, context?: Context) => {
  const { settlementId } = await (context as Context).params;
  return container.settlementsController.decline(request, settlementId);
}) as never;
