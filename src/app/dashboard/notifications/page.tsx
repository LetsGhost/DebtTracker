import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { DashboardNotificationsPage } from "@/frontend/modules/dashboard/pages/DashboardNotificationsPage";

export default async function DashboardNotificationsRoute() {
  const user = await getCurrentUserOrRedirect();
  return <DashboardNotificationsPage user={user} />;
}
