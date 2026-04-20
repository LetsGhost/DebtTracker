import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

import { GROUP_ROLES, GROUP_VISIBILITY_MODES } from "@/backend/modules/groups/groups.types";
import type { GroupRole, GroupVisibilityMode } from "@/backend/modules/groups/groups.types";

export class CreateGroupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  baseCurrency?: string;
}

export class InviteUserDto {
  @IsString()
  invitedUserId!: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateRoleDto {
  @IsEnum(GROUP_ROLES)
  role!: GroupRole;
}

export class UpdatePolicyDto {
  @IsOptional()
  @IsBoolean()
  canMembersInvite?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditorsAddExpense?: boolean;

  @IsOptional()
  @IsBoolean()
  canModeratorsAddExpense?: boolean;

  @IsOptional()
  @IsEnum(GROUP_VISIBILITY_MODES)
  visibilityMode?: GroupVisibilityMode;

  @IsOptional()
  @IsBoolean()
  canViewParticipatedExpenseDetails?: boolean;

  @IsOptional()
  @IsBoolean()
  requireReceiverConfirmationForSettlement?: boolean;

  @IsOptional()
  @IsBoolean()
  allowMemberRoleSelfLeave?: boolean;
}

export class BatchInviteDto {
  @IsArray()
  invitedUserIds!: string[];
}
