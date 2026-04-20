import { modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/model-registry";
import { MetadataEntity } from "@/backend/common/metadata.entity";
import { SETTLEMENT_STATUSES } from "@/backend/modules/groups/groups.types";
import type { SettlementStatus } from "@/backend/modules/groups/groups.types";

@modelOptions({
  schemaOptions: {
    collection: "settlements",
    timestamps: true,
  },
})
export class SettlementEntity extends MetadataEntity {
  @prop({ required: true })
  groupId!: string;

  @prop({ required: true })
  fromUserId!: string;

  @prop({ required: true })
  toUserId!: string;

  @prop({ required: true })
  amount!: number;

  @prop({ required: true, type: () => String, enum: SETTLEMENT_STATUSES, default: "pending_receiver" })
  status!: SettlementStatus;

  @prop()
  senderConfirmedAt?: Date;

  @prop()
  receiverDecisionAt?: Date;

  @prop()
  receiverDecisionReason?: string;

  @prop()
  expiresAt?: Date;
}

export const SettlementModel = getModelForClass(SettlementEntity);
