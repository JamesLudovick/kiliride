import {
  IsEmail,
  IsOptional,
  IsString,
  Length
} from "class-validator";

export class CreateDriverDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(5, 30)
  phone?: string;

  @IsString()
  @Length(3, 50)
  licenseNumber: string;
}
