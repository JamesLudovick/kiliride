import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import {
  MaintenanceStatus,
  MaintenanceType,
} from "@prisma/client";

export class CreateMaintenanceDto {
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsDateString()
  serviceDate: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  nextServiceDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  nextServiceMileage?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
