import { withLogging } from "@/backend/common/logging-middleware";
import { container } from "@/backend/container";

export const GET = withLogging(async (request) => container.sysAdminController.stats(request));
