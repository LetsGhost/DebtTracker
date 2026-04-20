import { ApiError } from "@/backend/common/errors";
import { DebtLedgerEntryModel } from "@/backend/modules/expenses/debt-ledger.entity";
import { ExpenseParticipantModel } from "@/backend/modules/expenses/expense-participant.entity";
import { ExpenseModel } from "@/backend/modules/expenses/expense.entity";
import { canAddExpense, getMemberContext } from "@/backend/modules/groups/groups.permissions";
import { SplitType } from "@/backend/modules/groups/groups.types";

type ParticipantInput = {
  userId: string;
  shareAmount?: number;
  sharePercent?: number;
};

export class ExpensesService {
  private resolveShares(totalAmount: number, splitType: SplitType, participants: ParticipantInput[]) {
    if (participants.length < 2) {
      throw new ApiError("At least two participants are required", 400);
    }

    if (splitType === "equal") {
      const shareAmount = Number((totalAmount / participants.length).toFixed(2));
      return participants.map((participant, index) => ({
        userId: participant.userId,
        sharePercent: undefined,
        shareAmount: index === participants.length - 1
          ? Number((totalAmount - shareAmount * (participants.length - 1)).toFixed(2))
          : shareAmount,
      }));
    }

    if (splitType === "percentage") {
      const sum = participants.reduce((acc, p) => acc + (p.sharePercent ?? 0), 0);

      if (Math.abs(sum - 100) > 0.001) {
        throw new ApiError("Percentage split must sum to 100", 400);
      }

      return participants.map((participant) => ({
        userId: participant.userId,
        sharePercent: participant.sharePercent,
        shareAmount: Number((totalAmount * ((participant.sharePercent ?? 0) / 100)).toFixed(2)),
      }));
    }

    const sum = participants.reduce((acc, p) => acc + (p.shareAmount ?? 0), 0);

    if (Math.abs(sum - totalAmount) > 0.01) {
      throw new ApiError("Custom shares must sum to total amount", 400);
    }

    return participants.map((participant) => ({
      userId: participant.userId,
      sharePercent: undefined,
      shareAmount: Number((participant.shareAmount ?? 0).toFixed(2)),
    }));
  }

  async createExpense(
    groupId: string,
    actorUserId: string,
    input: {
      title: string;
      note?: string;
      paidByUserId: string;
      totalAmount: number;
      splitType: SplitType;
      expenseDate: string;
      participants: ParticipantInput[];
    },
  ) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!canAddExpense(context.member.role, context.policy)) {
      throw new ApiError("Missing permission to create expenses", 403);
    }

    const resolvedShares = this.resolveShares(input.totalAmount, input.splitType, input.participants);

    const expense = await ExpenseModel.create({
      groupId,
      createdByUserId: actorUserId,
      paidByUserId: input.paidByUserId,
      title: input.title,
      note: input.note,
      totalAmount: input.totalAmount,
      splitType: input.splitType,
      expenseDate: new Date(input.expenseDate),
    });

    await ExpenseParticipantModel.insertMany(
      resolvedShares.map((participant) => ({
        expenseId: String(expense._id),
        userId: participant.userId,
        shareAmount: participant.shareAmount,
        sharePercent: participant.sharePercent,
      })),
    );

    const ledgerRows = resolvedShares
      .filter((participant) => participant.userId !== input.paidByUserId && participant.shareAmount > 0)
      .map((participant) => ({
        groupId,
        fromUserId: participant.userId,
        toUserId: input.paidByUserId,
        amount: participant.shareAmount,
        sourceType: "expense" as const,
        sourceId: String(expense._id),
      }));

    if (ledgerRows.length > 0) {
      await DebtLedgerEntryModel.insertMany(ledgerRows);
    }

    return {
      id: String(expense._id),
      groupId,
      title: expense.title,
      totalAmount: expense.totalAmount,
      splitType: expense.splitType,
    };
  }

  async listExpenses(groupId: string, actorUserId: string) {
    const context = await getMemberContext(groupId, actorUserId);

    const expenses = await ExpenseModel.find({ groupId }).sort({ expenseDate: -1 }).lean();

    if (context.policy.visibilityMode === "transparent" || context.member.role === "admin") {
      return expenses;
    }

    const participantExpenseIds = await ExpenseParticipantModel.find({ userId: actorUserId }).lean();
    const allowedIds = new Set(participantExpenseIds.map((x: { expenseId: string }) => x.expenseId));

    return expenses.filter((expense: { _id: string }) => allowedIds.has(String(expense._id)));
  }
}
