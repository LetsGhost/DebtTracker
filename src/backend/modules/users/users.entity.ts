import { index, modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";

@index({ email: 1 }, { unique: true })
@modelOptions({
  schemaOptions: {
    collection: "users",
    timestamps: true,
  },
})
export class UserEntity extends MetadataEntity {
  @prop({ required: true, trim: true })
  displayName!: string;

  @prop({ trim: true })
  firstName?: string;

  @prop({ trim: true })
  lastName?: string;

  @prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @prop({ required: true })
  passwordHash!: string;

  @prop()
  emailVerifiedAt?: Date;

  @prop()
  emailVerificationLastSentAt?: Date;

  @prop()
  suspendedAt?: Date;

  @prop()
  lastLoginAt?: Date;

  @prop({ default: true })
  emailNotificationsEnabled!: boolean;
}

export const UserModel = getModelForClass(UserEntity);
