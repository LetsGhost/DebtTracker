import { NextRequest } from "next/server";

import { getUserIdFromRequest } from "@/backend/common/auth/request-auth";
import { connectDatabase } from "@/backend/common/database/db";
import { ApiError } from "@/backend/common/errors/errors";
import { fail, ok } from "@/backend/common/http/response";
import { validateDto } from "@/backend/common/validation/validation";
import { CreateFriendRequestDto } from "@/backend/modules/friends/friends.dto";
import { FriendsService } from "@/backend/modules/friends/friends.service";

export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  async listFriends(request: NextRequest) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.friendsService.listFriends(userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async createRequest(request: NextRequest) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(CreateFriendRequestDto, await request.json());
      return ok(await this.friendsService.createRequest(userId, dto.email), 201);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async listRequests(request: NextRequest) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.friendsService.listRequests(userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async acceptRequest(request: NextRequest, requestId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.friendsService.acceptRequest(userId, requestId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async rejectRequest(request: NextRequest, requestId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.friendsService.rejectRequest(userId, requestId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }
}
