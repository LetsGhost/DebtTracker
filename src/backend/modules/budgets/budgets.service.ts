import { BudgetModel } from "@/backend/modules/budgets/budgets.entity";

export class BudgetsService {
  async listForUser(userId: string) {
    return BudgetModel.find({ userId }).sort({ month: -1 }).lean();
  }
}
