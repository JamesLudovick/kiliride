import { IsEnum, IsInt, IsOptional, IsString, Length } from "class-validator";

export enum VehicleType {
  SEDAN = "SEDAN",
  SUV = "SUV",
  VAN = "VAN",
  PICKUP = "PICKUP"
}

export class CreateVehicleDto {
  @IsString()
  @Length(3, 20)
  registrationNumber: string;

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsInt()
  year: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsEnum(VehicleType)
  type: VehicleType;
}