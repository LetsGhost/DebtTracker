import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { DashboardPage } from "@/frontend/modules/dashboard/pages/DashboardPage";

export default async function DashboardRoute() {
  const user = await getCurrentUserOrRedirect();

  return <DashboardPage user={user} />;
}
