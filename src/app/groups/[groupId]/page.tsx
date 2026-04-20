import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { GroupDetailsPage } from "@/frontend/modules/groups/pages/GroupDetailsPage";

type GroupRouteProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupDetailsRoute({ params }: GroupRouteProps) {
  const user = await getCurrentUserOrRedirect();
  const { groupId } = await params;
  return <GroupDetailsPage groupId={groupId} userId={user.id} />;
}
