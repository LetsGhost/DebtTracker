import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { connectDatabase } from "@/backend/common/database/db";
import { NotificationsService } from "@/backend/modules/notifications/notifications.service";
import { DashboardNotificationsPage } from "@/frontend/modules/dashboard/pages/DashboardNotificationsPage";

export default async function DashboardNotificationsRoute() {
  const user = await getCurrentUserOrRedirect();
  await connectDatabase();
  const notifications = await new NotificationsService().listForUser(user.id);
  return <DashboardNotificationsPage user={user} initialNotifications={notifications} />;
}
