import { modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";
import { SPLIT_TYPES } from "@/backend/modules/groups/groups.types";
import type { SplitType } from "@/backend/modules/groups/groups.types";

@modelOptions({
  schemaOptions: {
    collection: "p2p_expenses",
    timestamps: true,
  },
})
export class P2PExpenseEntity extends MetadataEntity {
  @prop({ required: true })
  threadId!: string;

  @prop({ required: true })
  createdByUserId!: string;

  @prop({ required: true })
  paidByUserId!: string;

  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  totalAmount!: number;

  @prop({ required: true, type: () => String, enum: SPLIT_TYPES })
  splitType!: SplitType;
}

export const P2PExpenseModel = getModelForClass(P2PExpenseEntity);
