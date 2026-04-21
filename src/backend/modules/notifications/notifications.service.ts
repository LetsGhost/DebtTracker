import { ApiError } from "@/backend/common/errors/errors";
import { NotificationModel } from "@/backend/modules/notifications/notification.entity";

export class NotificationsService {
  async listForUser(userId: string) {
    return NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async markAsRead(userId: string, notificationId: string) {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { readAt: new Date() } },
      { returnDocument: "after" },
    ).lean();
  }

  async delete(userId: string, notificationId: string) {
    const result = await NotificationModel.deleteOne({
      _id: notificationId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new ApiError("Notification not found", 404);
    }

    return { deleted: true };
  }

  async deleteAll(userId: string) {
    const result = await NotificationModel.deleteMany({ userId });
    return { deletedCount: result.deletedCount };
  }
}
