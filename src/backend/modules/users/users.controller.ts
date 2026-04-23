import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/database/db";
import { ApiError } from "@/backend/common/errors/errors";
import { getUserIdFromRequest } from "@/backend/common/auth/request-auth";
import { fail, ok } from "@/backend/common/http/response";
import { validateDto } from "@/backend/common/validation/validation";
import { CreateUserDto, UpdateUserSettingsDto } from "@/backend/modules/users/users.dto";
import { UsersService } from "@/backend/modules/users/users.service";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  async list(request: NextRequest) {
    try {
      await connectDatabase();
      getUserIdFromRequest(request);
      const query = request.nextUrl.searchParams.get("query") ?? "";
      return ok(await this.usersService.searchUsers(query));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async create(request: NextRequest) {
    try {
      await connectDatabase();
      getUserIdFromRequest(request);
      const dto = await validateDto(CreateUserDto, await request.json());
      const user = await this.usersService.createUser(dto);
      return ok(user, 201);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async me(request: NextRequest) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.usersService.getById(userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async updateMe(request: NextRequest) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(UpdateUserSettingsDto, await request.json());
      return ok(await this.usersService.updateUserSettings(userId, dto));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async deleteMe(request: NextRequest) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.usersService.deleteAccount(userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }
}
