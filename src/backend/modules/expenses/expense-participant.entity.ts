import { index, modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/model-registry";
import { MetadataEntity } from "@/backend/common/metadata.entity";

@index({ expenseId: 1, userId: 1 }, { unique: true })
@modelOptions({
  schemaOptions: {
    collection: "expense_participants",
    timestamps: true,
  },
})
export class ExpenseParticipantEntity extends MetadataEntity {
  @prop({ required: true })
  expenseId!: string;

  @prop({ required: true })
  userId!: string;

  @prop({ required: true })
  shareAmount!: number;

  @prop()
  sharePercent?: number;
}

export const ExpenseParticipantModel = getModelForClass(ExpenseParticipantEntity);
