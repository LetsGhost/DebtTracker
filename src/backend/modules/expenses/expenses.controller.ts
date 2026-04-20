import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/database/db";
import { ApiError } from "@/backend/common/errors/errors";
import { getUserIdFromRequest } from "@/backend/common/auth/request-auth";
import { fail, ok } from "@/backend/common/http/response";
import { validateDto } from "@/backend/common/validation/validation";
import { CreateExpenseDto } from "@/backend/modules/expenses/expenses.dto";
import { ExpensesService } from "@/backend/modules/expenses/expenses.service";

export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  async createExpense(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(CreateExpenseDto, await request.json());
      return ok(await this.expensesService.createExpense(groupId, userId, dto), 201);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async listExpenses(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.expensesService.listExpenses(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }
}
