import { NextRequest } from "next/server";

import { getUserIdFromRequest } from "@/backend/common/auth/request-auth";
import { ok } from "@/backend/common/http/response";
import { TransactionsService } from "@/backend/modules/transactions/transactions.service";

export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  async list(request: NextRequest) {
    const userId = getUserIdFromRequest(request);
    const transactions = await this.transactionsService.listForUser(userId);
    return ok(transactions);
  }
}
