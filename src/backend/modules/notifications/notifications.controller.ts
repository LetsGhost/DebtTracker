import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/database/db";
import { ApiError } from "@/backend/common/errors/errors";
import { getUserIdFromRequest } from "@/backend/common/auth/request-auth";
import { fail, ok } from "@/backend/common/http/response";
import { NotificationsService } from "@/backend/modules/notifications/notifications.service";

export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  async list(request: NextRequest) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.notificationsService.listForUser(userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async markRead(request: NextRequest, notificationId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.notificationsService.markAsRead(userId, notificationId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }
}
