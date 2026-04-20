import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

export const GET = withLogging(async (request) => container.p2pController.listThreads(request));
export const POST = withLogging(async (request) => container.p2pController.createThread(request));
