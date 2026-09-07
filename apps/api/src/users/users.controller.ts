import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
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
}
