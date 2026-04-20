import { modelOptions, prop, Severity } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/model-registry";
import { MetadataEntity } from "@/backend/common/metadata.entity";

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    collection: "notifications",
    timestamps: true,
  },
})
export class NotificationEntity extends MetadataEntity {
  @prop({ required: true })
  userId!: string;

  @prop({ required: true, enum: ["invite", "settlement_pending", "settlement_confirmed", "settlement_declined", "role_changed"] })
  type!: "invite" | "settlement_pending" | "settlement_confirmed" | "settlement_declined" | "role_changed";

  @prop({ required: true, type: () => Object })
  payload!: Record<string, unknown>;

  @prop()
  readAt?: Date;
}

export const NotificationModel = getModelForClass(NotificationEntity);
