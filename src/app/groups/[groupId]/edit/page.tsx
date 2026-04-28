import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { connectDatabase } from "@/backend/common/database/db";
import { GroupsService } from "@/backend/modules/groups/groups.service";
import { GroupEditPage } from "@/frontend/modules/groups/pages/GroupEditPage";

type GroupEditRouteProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupEditRoute({ params }: GroupEditRouteProps) {
  const user = await getCurrentUserOrRedirect();
  const { groupId } = await params;
  await connectDatabase();

  const groupsService = new GroupsService();
  const [initialGroup, initialMembers, initialInvites, initialPolicy] = await Promise.all([
    groupsService.getGroup(groupId, user.id),
    groupsService.listMembers(groupId, user.id),
    groupsService.listInvites(groupId, user.id),
    groupsService.getPolicy(groupId, user.id),
  ]);

  return (
    <GroupEditPage
      groupId={groupId}
      initialGroup={initialGroup}
      initialMembers={initialMembers}
      initialInvites={initialInvites}
      initialPolicy={initialPolicy}
    />
  );
}
