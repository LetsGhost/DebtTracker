import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/db";
import { env } from "@/backend/common/env";
import { ApiError } from "@/backend/common/errors";
import { getUserIdFromRequest } from "@/backend/common/request-auth";
import { fail, ok } from "@/backend/common/response";
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
  }

  async stats(request: NextRequest) {
    try {
      await connectDatabase();
      await this.ensureSysAdmin(request);
      return ok(await this.sysAdminService.getStats());
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }
}
