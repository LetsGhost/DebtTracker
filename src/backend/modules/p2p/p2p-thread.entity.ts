import { index, modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";

@index({ userAId: 1, userBId: 1 }, { unique: true })
@modelOptions({
  schemaOptions: {
    collection: "p2p_threads",
    timestamps: true,
  },
})
export class P2PThreadEntity extends MetadataEntity {
  @prop({ required: true })
  userAId!: string;

  @prop({ required: true })
  userBId!: string;

  @prop({ required: true, default: "EUR" })
  baseCurrency!: string;
}

export const P2PThreadModel = getModelForClass(P2PThreadEntity);
