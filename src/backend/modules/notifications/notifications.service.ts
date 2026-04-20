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
}
