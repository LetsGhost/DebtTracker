import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { SettlementsPage } from "@/frontend/modules/settlements/pages/SettlementsPage";

export default async function SettlementsRoute() {
  const user = await getCurrentUserOrRedirect();
  return <SettlementsPage userId={user.id} />;
}
