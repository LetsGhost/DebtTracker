import { NextRequest } from "next/server";

import { ok } from "@/backend/common/http/response";
import { TransactionsService } from "@/backend/modules/transactions/transactions.service";

export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  async list(_request: NextRequest, userId: string) {
    const transactions = await this.transactionsService.listForUser(userId);
    return ok(transactions);
  }
}
