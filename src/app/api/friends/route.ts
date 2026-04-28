import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

export const GET = withLogging(async (request) =>
  container.friendsController.listFriends(request)
);

export const POST = withLogging(async (request) =>
  container.friendsController.createRequest(request)
);
