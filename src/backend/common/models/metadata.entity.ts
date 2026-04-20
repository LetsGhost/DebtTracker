import { prop } from "@typegoose/typegoose";

export class MetadataEntity {
  @prop()
  public createdAt?: Date;

  @prop()
  public updatedAt?: Date;
}
