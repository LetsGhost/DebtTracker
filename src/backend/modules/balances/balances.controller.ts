import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/db";
import { ApiError } from "@/backend/common/errors";
import { getUserIdFromRequest } from "@/backend/common/request-auth";
import { fail, ok } from "@/backend/common/response";
import { BalancesService } from "@/backend/modules/balances/balances.service";

export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  async myBalances(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.balancesService.getMyBalances(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async groupGraph(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.balancesService.getGroupGraph(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }
}
