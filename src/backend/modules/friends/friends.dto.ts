import { IsEmail } from "class-validator";

export class CreateFriendRequestDto {
  @IsEmail()
  email!: string;
}
