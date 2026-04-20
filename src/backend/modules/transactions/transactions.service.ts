import { TransactionModel } from "@/backend/modules/transactions/transactions.entity";

export class TransactionsService {
  async listForUser(userId: string) {
    return TransactionModel.find({ userId }).sort({ bookedAt: -1 }).lean();
  }
}
