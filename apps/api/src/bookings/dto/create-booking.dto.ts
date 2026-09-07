import { ServiceType } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateBookingDto {
  @IsString()
  customerId: string;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsString()
  pickupLocation: string;

  @IsString()
  destination: string;

  @IsDateString()
  pickupDate: string;

  @IsDateString()
  dropoffDate: string;

  @IsInt()
  @Min(1)
  passengerCount: number;

  @IsNumber()
  @Min(0)
  fare: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
