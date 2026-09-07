import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { UsersService } from "./users.service";

@Controller("customers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findCustomers(
    @Query("includeArchived") includeArchived?: string,
  ) {
    return this.usersService.findCustomers(
      includeArchived === "true",
    );
  }

  @Post()
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.usersService.createCustomer(dto);
  }

  @Patch(":id")
  updateCustomer(
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.usersService.updateCustomer(id, dto);
  }

  @Patch(":id/archive")
  archiveCustomer(@Param("id") id: string) {
    return this.usersService.archiveCustomer(id);
  }

  @Patch(":id/restore")
  restoreCustomer(@Param("id") id: string) {
    return this.usersService.restoreCustomer(id);
  }

}
