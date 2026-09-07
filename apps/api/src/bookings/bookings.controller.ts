import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { UpdateBookingStatusDto } from "./dto/update-booking-status.dto";
import { BookingsService } from "./bookings.service";

@Controller("bookings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
  ) {}

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, dto);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }

  @Post(":id/payments")
  recordPayment(
    @Param("id") id: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.bookingsService.recordPayment(id, dto);
  }

  @Delete(":id/payments/:paymentId")
  deletePayment(
    @Param("id") id: string,
    @Param("paymentId") paymentId: string,
  ) {
    return this.bookingsService.deletePayment(
      id,
      paymentId,
    );
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string) {
    return this.bookingsService.cancel(id);
  }
}
