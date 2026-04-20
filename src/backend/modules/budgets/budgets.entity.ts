import { modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/model-registry";
import { MetadataEntity } from "@/backend/common/metadata.entity";

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
