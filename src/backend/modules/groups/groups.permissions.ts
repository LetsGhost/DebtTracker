import { ApiError } from "@/backend/common/errors/errors";
import { GroupMemberModel } from "@/backend/modules/groups/group-member.entity";
import { GroupPolicyModel } from "@/backend/modules/groups/group-policy.entity";
import type { GroupRole } from "@/backend/modules/groups/groups.types";

export const getMemberContext = async (groupId: string, userId: string) => {
  const member = await GroupMemberModel.findOne({ groupId, userId, removedAt: null }).lean();

  if (!member) {
    throw new ApiError("Not a group member", 403);
  }

  const policy = await GroupPolicyModel.findOne({ groupId }).lean();

  if (!policy) {
    throw new ApiError("Group policy missing", 500);
  }

  return { member, policy };
};

export const isAdminRole = (role: GroupRole) => role === "admin";

export const canInvite = (role: GroupRole, canMembersInvite: boolean) => {
  if (role === "admin" || role === "moderator") {
    return true;
  }

  if (role === "editor" || role === "viewer") {
    return canMembersInvite;
  }

  return false;
};

export const canManageMembers = (role: GroupRole) => role === "admin";

export const canAddExpense = (
  role: GroupRole,
  policy: { canEditorsAddExpense: boolean; canModeratorsAddExpense: boolean },
) => {
  if (role === "admin") {
    return true;
  }

  if (role === "moderator") {
    return policy.canModeratorsAddExpense;
  }

  if (role === "editor") {
    return policy.canEditorsAddExpense;
  }

  return false;
};

export const canViewGroupWideBalances = (role: GroupRole, visibilityMode: string) => {
  if (role === "admin") {
    return true;
  }

  return visibilityMode === "transparent";
};
