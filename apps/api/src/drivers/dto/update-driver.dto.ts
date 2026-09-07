import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(5, 30)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  licenseNumber?: string;
}
