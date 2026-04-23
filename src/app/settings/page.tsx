import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { SettingsPage } from "@/frontend/modules/settings/pages/SettingsPage";

export default async function SettingsRoute() {
  const user = await getCurrentUserOrRedirect();
  return <SettingsPage user={user} />;
}
