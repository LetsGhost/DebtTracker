import { DebtLedgerEntryModel } from "@/backend/modules/expenses/debt-ledger.entity";
import { getMemberContext } from "@/backend/modules/groups/groups.permissions";

type Edge = { fromUserId: string; toUserId: string; amount: number };

export class MinimizationService {
  async getTips(groupId: string, actorUserId: string) {
    await getMemberContext(groupId, actorUserId);

    const rows = await DebtLedgerEntryModel.find({ groupId }).lean();
    const net = new Map<string, number>();

    for (const row of rows) {
      net.set(row.fromUserId, (net.get(row.fromUserId) ?? 0) - row.amount);
      net.set(row.toUserId, (net.get(row.toUserId) ?? 0) + row.amount);
    }

    const debtors: Array<{ userId: string; amount: number }> = [];
    const creditors: Array<{ userId: string; amount: number }> = [];

    for (const [userId, amount] of net.entries()) {
      if (amount < -0.01) debtors.push({ userId, amount: Math.abs(amount) });
      if (amount > 0.01) creditors.push({ userId, amount });
    }

    const suggestions: Edge[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const transfer = Number(Math.min(debtor.amount, creditor.amount).toFixed(2));

      if (transfer > 0) {
        suggestions.push({ fromUserId: debtor.userId, toUserId: creditor.userId, amount: transfer });
      }

      debtor.amount = Number((debtor.amount - transfer).toFixed(2));
      creditor.amount = Number((creditor.amount - transfer).toFixed(2));

      if (debtor.amount <= 0.01) i += 1;
      if (creditor.amount <= 0.01) j += 1;
    }

    return {
      note: "Hints only. These do not execute automatically.",
      suggestions,
      currentLedgerRows: rows.length,
      suggestedTransfers: suggestions.length,
    };
  }
}
