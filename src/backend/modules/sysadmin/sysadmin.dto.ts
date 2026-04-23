import { IsBoolean } from "class-validator";

export class UpdateUserSuspensionDto {
  @IsBoolean()
  suspended!: boolean;
}
