import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/db";
import { ApiError } from "@/backend/common/errors";
import { getUserIdFromRequest } from "@/backend/common/request-auth";
import { fail, ok } from "@/backend/common/response";
import { validateDto } from "@/backend/common/validation";
import { CreateP2PExpenseDto, CreateP2PThreadDto } from "@/backend/modules/p2p/p2p.dto";
import { P2PService } from "@/backend/modules/p2p/p2p.service";

export class P2PController {
  constructor(private readonly p2pService: P2PService) {}

  async createThread(request: NextRequest) {
    try {
      await connectDatabase();
      const actorUserId = getUserIdFromRequest(request);
      const dto = await validateDto(CreateP2PThreadDto, await request.json());
      return ok(await this.p2pService.createThread(actorUserId, dto.peerUserId, dto.baseCurrency), 201);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async listThreads(request: NextRequest) {
    try {
      await connectDatabase();
      const actorUserId = getUserIdFromRequest(request);
      return ok(await this.p2pService.listThreads(actorUserId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async addExpense(request: NextRequest, threadId: string) {
    try {
      await connectDatabase();
      const actorUserId = getUserIdFromRequest(request);
      const dto = await validateDto(CreateP2PExpenseDto, await request.json());
      return ok(await this.p2pService.addExpense(threadId, actorUserId, dto), 201);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async balances(request: NextRequest, threadId: string) {
    try {
      await connectDatabase();
      const actorUserId = getUserIdFromRequest(request);
      return ok(await this.p2pService.threadBalances(threadId, actorUserId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }
}
