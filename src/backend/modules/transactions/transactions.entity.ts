import { modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";

@modelOptions({
  schemaOptions: {
    collection: "transactions",
    timestamps: true,
  },
})
export class TransactionEntity extends MetadataEntity {
  @prop({ required: true })
  userId!: string;

  @prop({ required: true })
  categoryId!: string;

  @prop({ required: true })
  amount!: number;

  @prop({ required: true, enum: ["income", "expense"] })
  type!: "income" | "expense";

  @prop({ required: true })
  bookedAt!: Date;

  @prop()
  note?: string;
}

export const TransactionModel = getModelForClass(TransactionEntity);
