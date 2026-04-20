import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

import { SPLIT_TYPES } from "@/backend/modules/groups/groups.types";

export class CreateP2PThreadDto {
  @IsString()
  peerUserId!: string;

  @IsOptional()
  @IsString()
  baseCurrency?: string;
}

export class CreateP2PExpenseDto {
  @IsString()
  paidByUserId!: string;

  @IsString()
  title!: string;

  @IsNumber()
  @Min(0.01)
  totalAmount!: number;

  @IsEnum(SPLIT_TYPES)
  splitType!: (typeof SPLIT_TYPES)[number];

  @IsArray()
  participants!: Array<{ userId: string; shareAmount?: number; sharePercent?: number }>;
}
