import { index, modelOptions, prop } from "@typegoose/typegoose";

import { getModelForClass } from "@/backend/common/models/model-registry";
import { MetadataEntity } from "@/backend/common/models/metadata.entity";

@index({ createdAt: -1 })
@index({ email: 1, createdAt: -1 })
@modelOptions({
  schemaOptions: {
    collection: "auth_login_audits",
    timestamps: true,
  },
})
export class AuthLoginAuditEntity extends MetadataEntity {
  @prop()
  userId?: string;

  @prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @prop({ required: true })
  success!: boolean;

  @prop()
  failureReason?: string;

  @prop()
  ipAddress?: string;

  @prop()
  userAgent?: string;
}

export const AuthLoginAuditModel = getModelForClass(AuthLoginAuditEntity);
