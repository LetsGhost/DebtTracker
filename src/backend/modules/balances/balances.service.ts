import { DebtLedgerEntryModel } from "@/backend/modules/expenses/debt-ledger.entity";
import { canViewGroupWideBalances, getMemberContext } from "@/backend/modules/groups/groups.permissions";

export class BalancesService {
  private aggregateLedger(rows: Array<{ fromUserId: string; toUserId: string; amount: number }>) {
    const pairNet = new Map<string, number>();

    rows.forEach((row) => {
      if (!row.fromUserId || !row.toUserId || row.fromUserId === row.toUserId) return;
      if (!Number.isFinite(row.amount) || row.amount <= 0) return;

      const [a, b] = [row.fromUserId, row.toUserId].sort();
      const pairKey = `${a}::${b}`;
      const directionSign = row.fromUserId === a ? 1 : -1;
      const next = (pairNet.get(pairKey) ?? 0) + directionSign * row.amount;
      pairNet.set(pairKey, Number(next.toFixed(2)));
    });

    const aggregated: Array<{ fromUserId: string; toUserId: string; amount: number }> = [];
    pairNet.forEach((net, key) => {
      if (Math.abs(net) < 0.005) return;

      const [a, b] = key.split("::");
      if (net > 0) {
        aggregated.push({ fromUserId: a, toUserId: b, amount: Number(net.toFixed(2)) });
      } else {
        aggregated.push({ fromUserId: b, toUserId: a, amount: Number(Math.abs(net).toFixed(2)) });
      }
    });

    return aggregated;
  }

  async getMyBalances(groupId: string, actorUserId: string) {
    await getMemberContext(groupId, actorUserId);

    const rows = await DebtLedgerEntryModel.find({
      groupId,
      $or: [{ fromUserId: actorUserId }, { toUserId: actorUserId }],
    }).lean();

    return this.aggregateLedger(rows).filter(
      (row) => row.fromUserId === actorUserId || row.toUserId === actorUserId,
    );
  }

  async getGroupGraph(groupId: string, actorUserId: string) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!canViewGroupWideBalances(context.member.role, context.policy.visibilityMode)) {
      return this.getMyBalances(groupId, actorUserId);
    }

    const rows = await DebtLedgerEntryModel.find({ groupId }).lean();
    return this.aggregateLedger(rows);
  }
}
