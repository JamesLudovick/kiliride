import { IsEnum } from "class-validator";
import { VehicleStatus } from "@prisma/client";

export class UpdateVehicleStatusDto {
  @IsEnum(VehicleStatus)
  status: VehicleStatus;
}
