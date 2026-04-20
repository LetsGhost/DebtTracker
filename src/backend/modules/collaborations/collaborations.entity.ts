import { modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";

@modelOptions({
  schemaOptions: {
    collection: "collaborations",
    timestamps: true,
  },
})
export class CollaborationEntity extends MetadataEntity {
  @prop({ required: true })
  ownerUserId!: string;

  @prop({ required: true })
  collaboratorUserId!: string;

  @prop({ required: true })
  role!: "viewer" | "editor";
}

export const CollaborationModel = getModelForClass(CollaborationEntity);
