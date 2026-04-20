import { modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";

@modelOptions({
  schemaOptions: {
    collection: "categories",
    timestamps: true,
  },
})
export class CategoryEntity extends MetadataEntity {
  @prop({ required: true })
  userId!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true, enum: ["income", "expense"] })
  type!: "income" | "expense";
}

export const CategoryModel = getModelForClass(CategoryEntity);
