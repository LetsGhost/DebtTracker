import { index, modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";
import { GROUP_ROLES } from "@/backend/modules/groups/groups.types";
import type { GroupRole } from "@/backend/modules/groups/groups.types";

@index({ groupId: 1, userId: 1 }, { unique: true })
@modelOptions({
  schemaOptions: {
    collection: "group_members",
    timestamps: true,
  },
})
export class GroupMemberEntity extends MetadataEntity {
  @prop({ required: true })
  groupId!: string;

  @prop({ required: true })
  userId!: string;

  @prop({ required: true, type: () => String, enum: GROUP_ROLES, default: "viewer" })
  role!: GroupRole;

  @prop({ required: true })
  addedByUserId!: string;

  @prop()
  removedAt?: Date;
}

export const GroupMemberModel = getModelForClass(GroupMemberEntity);
