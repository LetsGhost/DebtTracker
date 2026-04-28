import { ApiError } from "@/backend/common/errors/errors";
import { toObjectId } from "@/backend/common/models/id-helper";
import { NotificationModel } from "@/backend/modules/notifications/notification.entity";

const toPlainNotification = (notification: any) => ({
  _id: String(notification._id),
  userId: String(notification.userId),
  type: notification.type,
  payload: JSON.parse(JSON.stringify(notification.payload ?? {})) as Record<string, unknown>,
  readAt: notification.readAt ? new Date(notification.readAt).toISOString() : undefined,
  createdAt: notification.createdAt ? new Date(notification.createdAt).toISOString() : new Date().toISOString(),
});

export class NotificationsService {
  async listForUser(userId: string) {
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return notifications.map(toPlainNotification);
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: toObjectId(notificationId), userId },
      { $set: { readAt: new Date() } },
      { returnDocument: "after" },
    ).lean();

    return notification ? toPlainNotification(notification) : null;
  }

  async delete(userId: string, notificationId: string) {
    const result = await NotificationModel.deleteOne({
      _id: toObjectId(notificationId),
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
