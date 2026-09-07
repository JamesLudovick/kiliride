import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { SafeUser } from "../auth/types/auth-response";
import { DriversService } from "./drivers.service";
import { UpdateDriverBookingStatusDto } from "./dto/update-driver-booking-status.dto";

@Controller("driver-portal")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
export class DriverPortalController {
  constructor(
    private readonly driversService: DriversService
  ) {}

  @Get("me")
  me(@CurrentUser() user: SafeUser) {
    return this.driversService.findPortalProfile(user.id);
  }

  @Get("bookings")
  bookings(@CurrentUser() user: SafeUser) {
    return this.driversService.findPortalBookings(user.id);
  }

  @Patch("bookings/:id/status")
  updateBookingStatus(
    @CurrentUser() user: SafeUser,
    @Param("id") id: string,
    @Body() dto: UpdateDriverBookingStatusDto
  ) {
    return this.driversService.updatePortalBookingStatus(
      user.id,
      id,
      dto.status
    );
  }
}
