import { modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/model-registry";
import { MetadataEntity } from "@/backend/common/metadata.entity";

@modelOptions({
  schemaOptions: {
    collection: "debt_ledger_entries",
    timestamps: true,
  },
})
export class DebtLedgerEntryEntity extends MetadataEntity {
  @prop({ required: true })
  groupId!: string;

  @prop({ required: true })
  fromUserId!: string;

  @prop({ required: true })
  toUserId!: string;

  @prop({ required: true })
  amount!: number;

  @prop({ required: true, enum: ["expense", "settlement_adjustment"] })
  sourceType!: "expense" | "settlement_adjustment";

  @prop({ required: true })
  sourceId!: string;
}

export const DebtLedgerEntryModel = getModelForClass(DebtLedgerEntryEntity);
