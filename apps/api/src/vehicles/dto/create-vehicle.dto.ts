import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";
import { VehicleType } from "@prisma/client";

export class CreateVehicleDto {
  @IsString()
  @Length(3, 20)
  registrationNumber: string;

  @IsString()
  @Length(2, 50)
  make: string;

  @IsString()
  @Length(1, 50)
  model: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  color?: string;

  @IsEnum(VehicleType)
  type: VehicleType;
}
