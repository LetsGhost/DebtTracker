import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/database/db";
import { env } from "@/backend/common/config/env";
import { ApiError } from "@/backend/common/errors/errors";
import { getUserIdFromRequest } from "@/backend/common/auth/request-auth";
import { fail, ok } from "@/backend/common/http/response";
import { validateDto } from "@/backend/common/validation/validation";
import { UpdateUserSuspensionDto } from "@/backend/modules/sysadmin/sysadmin.dto";
import { UsersService } from "@/backend/modules/users/users.service";
import { SysAdminService } from "@/backend/modules/sysadmin/sysadmin.service";

export class SysAdminController {
  constructor(
    private readonly sysAdminService: SysAdminService,
    private readonly usersService: UsersService,
  ) {}

  private async ensureSysAdmin(request: NextRequest) {
    const userId = getUserIdFromRequest(request);
    const user = await this.usersService.getById(userId);

    if (!env.sysAdminEmails.includes(user.email.toLowerCase())) {
      throw new ApiError("Forbidden", 403);
    }

    return {
      userId,
      email: user.email,
    };
  }

  async stats(request: NextRequest) {
    try {
      await connectDatabase();
      await this.ensureSysAdmin(request);
      return ok(await this.sysAdminService.getStats());
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async listUsers(request: NextRequest) {
    try {
      await connectDatabase();
      await this.ensureSysAdmin(request);
      const query = request.nextUrl.searchParams.get("query") ?? "";
      return ok(await this.sysAdminService.listUsers(query));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async setUserSuspension(request: NextRequest, targetUserId: string) {
    try {
      await connectDatabase();
      const admin = await this.ensureSysAdmin(request);
      const dto = await validateDto(UpdateUserSuspensionDto, await request.json());
      return ok(await this.sysAdminService.setUserSuspension(targetUserId, dto.suspended, admin.userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }

  async deleteUser(request: NextRequest, targetUserId: string) {
    try {
      await connectDatabase();
      const admin = await this.ensureSysAdmin(request);
      return ok(await this.sysAdminService.deleteUser(targetUserId, admin.userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode, error);
      return fail("Internal server error", 500, error);
    }
  }
}
