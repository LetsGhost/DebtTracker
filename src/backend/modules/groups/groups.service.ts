import { ApiError } from "@/backend/common/errors/errors";
import { getEventBus } from "@/backend/common/events/event-bus";
import { GroupModel } from "@/backend/modules/groups/group.entity";
import { GroupInviteModel } from "@/backend/modules/groups/group-invite.entity";
import { GroupMemberModel } from "@/backend/modules/groups/group-member.entity";
import { GroupPolicyModel } from "@/backend/modules/groups/group-policy.entity";
import { UserModel } from "@/backend/modules/users/users.entity";
import { canInvite, canManageMembers, getMemberContext, isAdminRole } from "@/backend/modules/groups/groups.permissions";
import type { GroupRole } from "@/backend/modules/groups/groups.types";

export class GroupsService {
  async getGroup(groupId: string, actorUserId: string) {
    const context = await getMemberContext(groupId, actorUserId);
    const group = await GroupModel.findOne({ _id: groupId, deletedAt: null }).lean();

    if (!group) {
      throw new ApiError("Group not found", 404);
    }

    return {
      id: String(group._id),
      name: group.name,
      baseCurrency: group.baseCurrency,
      createdByUserId: group.createdByUserId,
      isArchived: group.isArchived,
      myRole: context.member.role,
      isAdmin: context.member.role === "admin",
    };
  }

  async createGroup(userId: string, input: { name: string; baseCurrency?: string }) {
    const group = await GroupModel.create({
      name: input.name,
      createdByUserId: userId,
      baseCurrency: input.baseCurrency ?? "EUR",
      isArchived: false,
    });

    await GroupMemberModel.create({
      groupId: String(group._id),
      userId,
      role: "admin",
      addedByUserId: userId,
    });

    await GroupPolicyModel.create({
      groupId: String(group._id),
      canMembersInvite: false,
      canEditorsAddExpense: true,
      canModeratorsAddExpense: true,
      visibilityMode: "hybrid",
      canViewParticipatedExpenseDetails: true,
      requireReceiverConfirmationForSettlement: true,
      allowMemberRoleSelfLeave: true,
    });

    return {
      id: String(group._id),
      name: group.name,
      baseCurrency: group.baseCurrency,
      createdByUserId: group.createdByUserId,
    };
  }

  async listGroups(userId: string) {
    const memberships = await GroupMemberModel.find({ userId, removedAt: null }).lean();
    const groupIds = memberships.map((x: { groupId: string }) => x.groupId);
    const groups = await GroupModel.find({ _id: { $in: groupIds }, deletedAt: null }).lean();

    return groups.map((g: { _id: string; name: string; baseCurrency: string; createdByUserId: string }) => ({
      id: String(g._id),
      name: g.name,
      baseCurrency: g.baseCurrency,
      createdByUserId: g.createdByUserId,
    }));
  }

  async inviteUser(groupId: string, actorUserId: string, invitedUserId: string, message?: string) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!canInvite(context.member.role, context.policy.canMembersInvite)) {
      throw new ApiError("Missing invite permission", 403);
    }

    const existingMember = await GroupMemberModel.findOne({ groupId, userId: invitedUserId, removedAt: null }).lean();

    if (existingMember) {
      throw new ApiError("User already in group", 409);
    }

    const invite = await GroupInviteModel.create({
      groupId,
      invitedUserId,
      invitedByUserId: actorUserId,
      message,
      status: "pending",
    });

    await getEventBus().emit("group.invite.created", {
      inviteId: String(invite._id),
      groupId,
      invitedUserId,
      invitedByUserId: actorUserId,
      message,
    });

    return {
      id: String(invite._id),
      status: invite.status,
      invitedUserId: invite.invitedUserId,
    };
  }

  async acceptInvite(inviteId: string, userId: string) {
    const invite = await GroupInviteModel.findById(inviteId);

    if (!invite || invite.status !== "pending") {
      throw new ApiError("Invite is not active", 404);
    }

    if (invite.invitedUserId !== userId) {
      throw new ApiError("Cannot accept invite for another user", 403);
    }

    invite.status = "accepted";
    invite.actedAt = new Date();
    await invite.save();

    await GroupMemberModel.create({
      groupId: invite.groupId,
      userId,
      role: "viewer",
      addedByUserId: invite.invitedByUserId,
    });

    return { accepted: true };
  }

  async rejectInvite(inviteId: string, userId: string) {
    const invite = await GroupInviteModel.findById(inviteId);

    if (!invite || invite.status !== "pending") {
      throw new ApiError("Invite is not active", 404);
    }

    if (invite.invitedUserId !== userId) {
      throw new ApiError("Cannot reject invite for another user", 403);
    }

    invite.status = "rejected";
    invite.actedAt = new Date();
    await invite.save();

    return { rejected: true };
  }

  async revokeInvite(inviteId: string, actorUserId: string) {
    const invite = await GroupInviteModel.findById(inviteId);

    if (!invite || invite.status !== "pending") {
      throw new ApiError("Invite is not active", 404);
    }

    const context = await getMemberContext(invite.groupId, actorUserId);

    if (!canManageMembers(context.member.role)) {
      throw new ApiError("Missing invite revocation permission", 403);
    }

    invite.status = "revoked";
    invite.actedAt = new Date();
    await invite.save();

    return { revoked: true };
  }

  async updateMemberRole(groupId: string, actorUserId: string, targetUserId: string, role: GroupRole) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!canManageMembers(context.member.role)) {
      throw new ApiError("Missing role management permission", 403);
    }

    const member = await GroupMemberModel.findOne({ groupId, userId: targetUserId, removedAt: null });

    if (!member) {
      throw new ApiError("Target member not found", 404);
    }

    member.role = role;
    await member.save();

    return { updated: true, role };
  }

  async removeMember(groupId: string, actorUserId: string, targetUserId: string) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!canManageMembers(context.member.role)) {
      throw new ApiError("Missing member removal permission", 403);
    }

    const member = await GroupMemberModel.findOne({ groupId, userId: targetUserId, removedAt: null });

    if (!member) {
      throw new ApiError("Target member not found", 404);
    }

    if (isAdminRole(member.role) && targetUserId === actorUserId) {
      throw new ApiError("Admin cannot remove self", 400);
    }

    member.removedAt = new Date();
    await member.save();

    return { removed: true };
  }

  async leaveGroup(groupId: string, actorUserId: string) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!context.policy.allowMemberRoleSelfLeave) {
      throw new ApiError("Leaving this group is disabled by policy", 403);
    }

    if (context.member.role === "admin") {
      const activeAdmins = await GroupMemberModel.countDocuments({
        groupId,
        removedAt: null,
        role: "admin",
      });

      if (activeAdmins <= 1) {
        throw new ApiError("Assign another admin before leaving the group", 400);
      }
    }

    const member = await GroupMemberModel.findOne({ groupId, userId: actorUserId, removedAt: null });

    if (!member) {
      throw new ApiError("Member not found", 404);
    }

    member.removedAt = new Date();
    await member.save();

    return { left: true };
  }

  async deleteGroup(groupId: string, actorUserId: string) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!isAdminRole(context.member.role)) {
      throw new ApiError("Only admins can delete a group", 403);
    }

    const group = await GroupModel.findOne({ _id: groupId, deletedAt: null });

    if (!group) {
      throw new ApiError("Group not found", 404);
    }

    group.deletedAt = new Date();
    group.isArchived = true;
    await group.save();

    await GroupMemberModel.updateMany({ groupId, removedAt: null }, { $set: { removedAt: new Date() } });

    return { deleted: true };
  }

  async updatePolicy(groupId: string, actorUserId: string, patch: object) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!isAdminRole(context.member.role)) {
      throw new ApiError("Only admins can update group policy", 403);
    }

    const updated = await GroupPolicyModel.findOneAndUpdate(
      { groupId },
      { $set: patch },
      { returnDocument: "after" },
    ).lean();

    return updated;
  }

  async getPolicy(groupId: string, actorUserId: string) {
    await getMemberContext(groupId, actorUserId);
    const policy = await GroupPolicyModel.findOne({ groupId }).lean();

    if (!policy) {
      throw new ApiError("Policy not found", 404);
    }

    return policy;
  }

  async listInvites(groupId: string, actorUserId: string) {
    const context = await getMemberContext(groupId, actorUserId);

    if (!isAdminRole(context.member.role)) {
      throw new ApiError("Only admins can list all invites", 403);
    }

    const invites = await GroupInviteModel.find({ groupId }).sort({ createdAt: -1 }).lean();
    
    const userIds = invites
      .map((i: any) => i.invitedUserId)
      .filter((id: string) => id && id.length > 0);
    
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map<string, { displayName: string; email: string }>(
      users.map((u: any) => [String(u._id), { displayName: u.displayName as string, email: u.email as string }])
    );

    return invites.map((invite: any) => {
      const user = userMap.get(invite.invitedUserId) ?? { displayName: "", email: "" };
      return {
        ...invite,
        invitedUserDisplayName: user.displayName,
        invitedUserEmail: user.email,
      };
    });
  }

  async listMembers(groupId: string, actorUserId: string) {
    await getMemberContext(groupId, actorUserId);

    const members = await GroupMemberModel.find({ groupId, removedAt: null })
      .sort({ createdAt: 1 })
      .lean();

    const userIds = members.map((m: { userId: string }) => m.userId);
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map<string, { displayName: string; email: string }>(
      users.map((u: any) => [String(u._id), { displayName: u.displayName as string, email: u.email as string }])
    );

    return members.map((member: { _id: string; userId: string; role: GroupRole; addedByUserId: string }) => {
      const user = userMap.get(member.userId) ?? { displayName: member.userId, email: "" };
      return {
        id: String(member._id),
        userId: member.userId,
        displayName: user.displayName,
        email: user.email,
        role: member.role,
        addedByUserId: member.addedByUserId,
      };
    });
  }
}
