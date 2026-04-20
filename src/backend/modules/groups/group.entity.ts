import { modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";

@modelOptions({
  schemaOptions: {
    collection: "groups",
    timestamps: true,
  },
})
export class GroupEntity extends MetadataEntity {
  @prop({ required: true, trim: true })
  name!: string;

  @prop({ required: true })
  createdByUserId!: string;

  @prop({ required: true, default: "EUR" })
  baseCurrency!: string;

  @prop({ required: true, default: false })
  isArchived!: boolean;

  @prop()
  deletedAt?: Date;
}

export const GroupModel = getModelForClass(GroupEntity);
