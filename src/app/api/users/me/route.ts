import { clearAuthCookie } from "@/backend/common/auth/auth";
import { withLogging } from "@/backend/common/logging/logging-middleware";
import { container } from "@/backend/container";

export const GET = withLogging(async (request) =>
  container.usersController.me(request)
);

export const PATCH = withLogging(async (request) =>
  container.usersController.updateMe(request)
);

export const DELETE = withLogging(async (request) => {
  const response = await container.usersController.deleteMe(request);
  clearAuthCookie(response);
  return response;
});
