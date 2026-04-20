import { DebtLedgerEntryModel } from "@/backend/modules/expenses/debt-ledger.entity";
import { canViewGroupWideBalances, getMemberContext } from "@/backend/modules/groups/groups.permissions";

export class BalancesService {
  async getMyBalances(groupId: string, actorUserId: string) {
    await getMemberContext(groupId, actorUserId);

    const rows = await DebtLedgerEntryModel.find({
      groupId,
      $or: [{ fromUserId: actorUserId }, { toUserId: actorUserId }],
    }).lean();

    return rows;
  }

  async getGroupGraph(groupId: string, actorUserId: string) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!canViewGroupWideBalances(context.member.role, context.policy.visibilityMode)) {
      return this.getMyBalances(groupId, actorUserId);
    }

    return DebtLedgerEntryModel.find({ groupId }).lean();
  }
}
