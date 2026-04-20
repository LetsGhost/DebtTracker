import { ApiError } from "@/backend/common/errors/errors";
import { P2PExpenseModel } from "@/backend/modules/p2p/p2p-expense.entity";
import { P2PThreadModel } from "@/backend/modules/p2p/p2p-thread.entity";

export class P2PService {
  async createThread(actorUserId: string, peerUserId: string, baseCurrency = "EUR") {
    if (actorUserId === peerUserId) {
      throw new ApiError("Cannot create a P2P thread with yourself", 400);
    }

    const [userAId, userBId] = [actorUserId, peerUserId].sort();

    const existing = await P2PThreadModel.findOne({ userAId, userBId }).lean();

    if (existing) {
      return existing;
    }

    return P2PThreadModel.create({ userAId, userBId, baseCurrency });
  }

  async listThreads(actorUserId: string) {
    return P2PThreadModel.find({ $or: [{ userAId: actorUserId }, { userBId: actorUserId }] }).lean();
  }

  async addExpense(threadId: string, actorUserId: string, input: { paidByUserId: string; title: string; totalAmount: number; splitType: string }) {
    const thread = await P2PThreadModel.findById(threadId).lean();

    if (!thread) {
      throw new ApiError("P2P thread not found", 404);
    }

    if (thread.userAId !== actorUserId && thread.userBId !== actorUserId) {
      throw new ApiError("Not part of this thread", 403);
    }

    return P2PExpenseModel.create({
      threadId,
      createdByUserId: actorUserId,
      paidByUserId: input.paidByUserId,
      title: input.title,
      totalAmount: input.totalAmount,
      splitType: input.splitType,
    });
  }

  async threadBalances(threadId: string, actorUserId: string) {
    const thread = await P2PThreadModel.findById(threadId).lean();

    if (!thread) {
      throw new ApiError("P2P thread not found", 404);
    }

    if (thread.userAId !== actorUserId && thread.userBId !== actorUserId) {
      throw new ApiError("Not part of this thread", 403);
    }

    const expenses = await P2PExpenseModel.find({ threadId }).lean();

    let balance = 0;

    for (const expense of expenses) {
      const half = Number((expense.totalAmount / 2).toFixed(2));
      if (expense.paidByUserId === actorUserId) {
        balance += half;
      } else {
        balance -= half;
      }
    }

    return {
      threadId,
      actorUserId,
      netBalance: Number(balance.toFixed(2)),
    };
  }
}
