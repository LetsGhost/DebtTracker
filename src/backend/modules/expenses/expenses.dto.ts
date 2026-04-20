import { Type } from "class-transformer";
import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";

import { SPLIT_TYPES } from "@/backend/modules/groups/groups.types";
import type { SplitType } from "@/backend/modules/groups/groups.types";

export class ExpenseParticipantDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shareAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sharePercent?: number;
}

export class CreateExpenseDto {
  @IsString()
  @MaxLength(140)
  title!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  paidByUserId!: string;

  @IsNumber()
  @Min(0.01)
  totalAmount!: number;

  @IsEnum(SPLIT_TYPES)
  splitType!: SplitType;

  @IsDateString()
  expenseDate!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseParticipantDto)
  participants!: ExpenseParticipantDto[];
}
