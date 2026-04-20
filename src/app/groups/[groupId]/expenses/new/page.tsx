import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { GroupExpenseCreatePage } from "@/frontend/modules/groups/pages/GroupExpenseCreatePage";

type RouteProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupExpenseCreateRoute({ params }: RouteProps) {
  const user = await getCurrentUserOrRedirect();
  const { groupId } = await params;
  return <GroupExpenseCreatePage groupId={groupId} userId={user.id} />;
}
