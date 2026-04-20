import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/database/db";
import { ApiError } from "@/backend/common/errors/errors";
import { getUserIdFromRequest } from "@/backend/common/auth/request-auth";
import { fail, ok } from "@/backend/common/http/response";
import { validateDto } from "@/backend/common/validation/validation";
import { BalancesService } from "@/backend/modules/balances/balances.service";
import { ExpensesService } from "@/backend/modules/expenses/expenses.service";
import { BatchInviteDto, CreateGroupDto, InviteUserDto, UpdatePolicyDto, UpdateRoleDto } from "@/backend/modules/groups/groups.dto";
import { GroupsService } from "@/backend/modules/groups/groups.service";
import { SettlementsService } from "@/backend/modules/settlements/settlements.service";

export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly expensesService: ExpensesService,
    private readonly balancesService: BalancesService,
    private readonly settlementsService: SettlementsService,
  ) {}

  async getGroup(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.getGroup(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async getDetailsBundle(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);

      const [group, policy, expenses, balances, members, settlements] = await Promise.all([
        this.groupsService.getGroup(groupId, userId),
        this.groupsService.getPolicy(groupId, userId),
        this.expensesService.listExpenses(groupId, userId),
        this.balancesService.getGroupGraph(groupId, userId),
        this.groupsService.listMembers(groupId, userId),
        this.settlementsService.list(groupId, userId),
      ]);

      return ok({
        group,
        policy,
        expenses,
        balances,
        members,
        settlements,
      });
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async createGroup(request: NextRequest) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(CreateGroupDto, await request.json());
      return ok(await this.groupsService.createGroup(userId, dto), 201);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async listGroups(request: NextRequest) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.listGroups(userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async invite(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(InviteUserDto, await request.json());
      return ok(await this.groupsService.inviteUser(groupId, userId, dto.invitedUserId, dto.message), 201);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async batchInvite(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(BatchInviteDto, await request.json());
      const results = await Promise.all(
        dto.invitedUserIds.map((id) => this.groupsService.inviteUser(groupId, userId, id)),
      );
      return ok(results, 201);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async acceptInvite(request: NextRequest, inviteId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.acceptInvite(inviteId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async rejectInvite(request: NextRequest, inviteId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.rejectInvite(inviteId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async revokeInvite(request: NextRequest, inviteId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.revokeInvite(inviteId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async listInvites(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.listInvites(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async listMembers(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.listMembers(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async updateRole(request: NextRequest, groupId: string, targetUserId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(UpdateRoleDto, await request.json());
      return ok(await this.groupsService.updateMemberRole(groupId, userId, targetUserId, dto.role));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async removeMember(request: NextRequest, groupId: string, targetUserId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.removeMember(groupId, userId, targetUserId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async leaveGroup(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.leaveGroup(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async deleteGroup(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.deleteGroup(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async getPolicy(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      return ok(await this.groupsService.getPolicy(groupId, userId));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }

  async updatePolicy(request: NextRequest, groupId: string) {
    try {
      await connectDatabase();
      const userId = getUserIdFromRequest(request);
      const dto = await validateDto(UpdatePolicyDto, await request.json());
      return ok(await this.groupsService.updatePolicy(groupId, userId, dto));
    } catch (error) {
      if (error instanceof ApiError) return fail(error.message, error.statusCode);
      return fail("Internal server error", 500);
    }
  }
}
