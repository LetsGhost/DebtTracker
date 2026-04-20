import { index, modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";
import { INVITE_STATUSES } from "@/backend/modules/groups/groups.types";
import type { InviteStatus } from "@/backend/modules/groups/groups.types";

@index({ groupId: 1, invitedUserId: 1, status: 1 })
@modelOptions({
  schemaOptions: {
    collection: "group_invites",
    timestamps: true,
  },
})
export class GroupInviteEntity extends MetadataEntity {
  @prop({ required: true })
  groupId!: string;

  @prop({ required: true })
  invitedUserId!: string;

  @prop({ required: true })
  invitedByUserId!: string;

  @prop({ required: true, type: () => String, enum: INVITE_STATUSES, default: "pending" })
  status!: InviteStatus;

  @prop()
  message?: string;

  @prop()
  expiresAt?: Date;

  @prop()
  actedAt?: Date;
}

export const GroupInviteModel = getModelForClass(GroupInviteEntity);
