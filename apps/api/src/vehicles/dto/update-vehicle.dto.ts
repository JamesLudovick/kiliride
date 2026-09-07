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

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @Length(3, 20)
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  make?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentMileage?: number;

  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;
}
