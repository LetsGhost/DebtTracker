import { NextRequest } from "next/server";

import { connectDatabase } from "@/backend/common/db";
import { ApiError } from "@/backend/common/errors";
import { getUserIdFromRequest } from "@/backend/common/request-auth";
import { fail, ok } from "@/backend/common/response";
import { validateDto } from "@/backend/common/validation";
import { BatchInviteDto, CreateGroupDto, InviteUserDto, UpdatePolicyDto, UpdateRoleDto } from "@/backend/modules/groups/groups.dto";
import { GroupsService } from "@/backend/modules/groups/groups.service";

export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

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
