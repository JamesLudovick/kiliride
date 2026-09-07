import { IsEnum } from "class-validator";
import { DriverAvailability } from "@prisma/client";

export class UpdateDriverAvailabilityDto {
  @IsEnum(DriverAvailability)
  availability: DriverAvailability;
}
