import { NextRequest } from "next/server";

import { ok } from "@/backend/common/http/response";
import { BudgetsService } from "@/backend/modules/budgets/budgets.service";

export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  async list(_request: NextRequest, userId: string) {
    const budgets = await this.budgetsService.listForUser(userId);
    return ok(budgets);
  }
}
