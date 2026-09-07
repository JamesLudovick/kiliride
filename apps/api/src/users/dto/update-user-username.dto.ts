import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUserUsernameDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      "Username can only contain letters, numbers, dots, underscores and hyphens.",
  })
  username!: string;
}
