import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
  findCustomers() {
    return this.usersService.findCustomers();
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
}
