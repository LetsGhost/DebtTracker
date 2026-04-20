import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/db";
import { ApiError } from "@/backend/common/errors";
import { getUserIdFromRequest } from "@/backend/common/request-auth";
import { fail, ok } from "@/backend/common/response";
import { validateDto } from "@/backend/common/validation";
import { CreateUserDto } from "@/backend/modules/users/users.dto";
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
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async create(request: NextRequest) {
    await connectDatabase();
    const dto = await validateDto(CreateUserDto, await request.json());
    const user = await this.usersService.createUser(dto);
    return ok(user, 201);
  }
}
