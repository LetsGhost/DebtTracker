import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { connectDatabase } from "@/backend/common/database/db";
import { BalancesService } from "@/backend/modules/balances/balances.service";
import { ExpensesService } from "@/backend/modules/expenses/expenses.service";
import { GroupsService } from "@/backend/modules/groups/groups.service";
import { SettlementsService } from "@/backend/modules/settlements/settlements.service";
import { GroupDetailsPage } from "@/frontend/modules/groups/pages/GroupDetailsPage";

type GroupRouteProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupDetailsRoute({ params }: GroupRouteProps) {
  const user = await getCurrentUserOrRedirect();
  const { groupId } = await params;
  await connectDatabase();

  const groupsService = new GroupsService();
  const expensesService = new ExpensesService();
  const balancesService = new BalancesService();
  const settlementsService = new SettlementsService();

  const [group, policy, expenses, balances, members, settlements] = await Promise.all([
    groupsService.getGroup(groupId, user.id),
    groupsService.getPolicy(groupId, user.id),
    expensesService.listExpenses(groupId, user.id),
    balancesService.getGroupGraph(groupId, user.id),
    groupsService.listMembers(groupId, user.id),
    settlementsService.list(groupId, user.id),
  ]);

  return <GroupDetailsPage groupId={groupId} userId={user.id} initialBundle={{ group, policy, expenses, balances, members, settlements }} />;
}
