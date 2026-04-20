import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { GroupsOverviewPage } from "@/frontend/modules/groups/pages/GroupsOverviewPage";

export default async function GroupsRoute() {
  await getCurrentUserOrRedirect();
  return <GroupsOverviewPage />;
}
