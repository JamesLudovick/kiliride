import { AirportTransferType, ServiceType } from "@prisma/client";
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
  @IsEnum(AirportTransferType)
  airportTransferType?: AirportTransferType;

  @IsOptional()
  @IsString()
  flightNumber?: string;

  @IsOptional()
  @IsString()
  airline?: string;

  @IsOptional()
  @IsString()
  airportTerminal?: string;

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
