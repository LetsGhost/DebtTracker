import { modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";

@modelOptions({
  schemaOptions: {
    collection: "budgets",
    timestamps: true,
  },
})
export class BudgetEntity extends MetadataEntity {
  @prop({ required: true })
  userId!: string;

  @prop({ required: true })
  categoryId!: string;

  @prop({ required: true })
  month!: string;

  @prop({ required: true })
  amountLimit!: number;
}

export const BudgetModel = getModelForClass(BudgetEntity);
