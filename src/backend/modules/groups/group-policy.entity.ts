import { index, modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";
import { GROUP_VISIBILITY_MODES } from "@/backend/modules/groups/groups.types";
import type { GroupVisibilityMode } from "@/backend/modules/groups/groups.types";

@index({ groupId: 1 }, { unique: true })
@modelOptions({
  schemaOptions: {
    collection: "group_policies",
    timestamps: true,
  },
})
export class GroupPolicyEntity extends MetadataEntity {
  @prop({ required: true })
  groupId!: string;

  @prop({ required: true, default: false })
  canMembersInvite!: boolean;

  @prop({ required: true, default: true })
  canEditorsAddExpense!: boolean;

  @prop({ required: true, default: true })
  canModeratorsAddExpense!: boolean;

  @prop({ required: true, type: () => String, enum: GROUP_VISIBILITY_MODES, default: "hybrid" })
  visibilityMode!: GroupVisibilityMode;

  @prop({ required: true, default: true })
  canViewParticipatedExpenseDetails!: boolean;

  @prop({ required: true, default: true })
  requireReceiverConfirmationForSettlement!: boolean;

  @prop({ required: true, default: true })
  allowMemberRoleSelfLeave!: boolean;
}

export const GroupPolicyModel = getModelForClass(GroupPolicyEntity);
