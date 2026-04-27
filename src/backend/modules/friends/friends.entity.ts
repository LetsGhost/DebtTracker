import { index, modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";

@index({ requesterUserId: 1, recipientUserId: 1 })
@index({ recipientUserId: 1, requesterUserId: 1 })
@modelOptions({
  schemaOptions: {
    collection: "friend_requests",
    timestamps: true,
  },
})
export class FriendRequestEntity extends MetadataEntity {
  @prop({ required: true })
  requesterUserId!: string;

  @prop({ required: true })
  recipientUserId!: string;

  @prop({ required: true, enum: ["pending", "accepted", "rejected"] })
  status!: "pending" | "accepted" | "rejected";

  @prop()
  actedAt?: Date;
}

export const FriendRequestModel = getModelForClass(FriendRequestEntity);
