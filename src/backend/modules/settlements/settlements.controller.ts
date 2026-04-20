import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/db";
import { ApiError } from "@/backend/common/errors";
import { getUserIdFromRequest } from "@/backend/common/request-auth";
import { fail, ok } from "@/backend/common/response";
import { validateDto } from "@/backend/common/validation";
import { CreateSettlementDto, DeclineSettlementDto } from "@/backend/modules/settlements/settlements.dto";
import { SettlementsService } from "@/backend/modules/settlements/settlements.service";

export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  async create(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(CreateSettlementDto, await request.json());
      return ok(await this.settlementsService.create(groupId, userId, dto.toUserId, dto.amount), 201);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async list(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.settlementsService.list(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async confirmReceived(request: NextRequest, settlementId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.settlementsService.confirmReceived(settlementId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async decline(request: NextRequest, settlementId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(DeclineSettlementDto, await request.json());
      return ok(await this.settlementsService.decline(settlementId, userId, dto.reason));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }
}
