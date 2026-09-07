import { BookingStatus } from "@prisma/client";
import { IsIn } from "class-validator";

export class UpdateDriverBookingStatusDto {
  @IsIn([
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED,
  ])
  status!: "IN_PROGRESS" | "COMPLETED";
}
