import { MaintenanceStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateMaintenanceStatusDto {
  @IsEnum(MaintenanceStatus)
  status: MaintenanceStatus;
}
