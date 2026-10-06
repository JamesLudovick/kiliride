import { IsEnum } from "class-validator";
import { UserStatus } from "@prisma/client";

export class UpdateDriverStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}
