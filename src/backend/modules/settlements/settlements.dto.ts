import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateSettlementDto {
  @IsString()
  toUserId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}

export class DeclineSettlementDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
