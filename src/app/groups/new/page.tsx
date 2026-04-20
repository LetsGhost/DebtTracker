import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { GroupCreatePage } from "@/frontend/modules/groups/pages/GroupCreatePage";

export default async function GroupCreateRoute() {
  await getCurrentUserOrRedirect();
  return <GroupCreatePage />;
}
