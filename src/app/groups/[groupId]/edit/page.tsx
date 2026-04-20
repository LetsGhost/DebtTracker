import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { GroupEditPage } from "@/frontend/modules/groups/pages/GroupEditPage";

type GroupEditRouteProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupEditRoute({ params }: GroupEditRouteProps) {
  await getCurrentUserOrRedirect();
  const { groupId } = await params;
  return <GroupEditPage groupId={groupId} />;
}
