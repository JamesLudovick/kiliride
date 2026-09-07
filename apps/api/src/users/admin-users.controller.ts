import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ResetUserPasswordDto } from "./dto/reset-user-password.dto";
import { UpdateUserUsernameDto } from "./dto/update-user-username.dto";
import { UsersService } from "./users.service";

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findAccounts() {
    return this.usersService.findAccounts();
  }

  @Patch(":id/password")
  resetPassword(
    @Param("id") id: string,
    @Body() dto: ResetUserPasswordDto,
  ) {
    return this.usersService.resetPassword(
      id,
      dto.password,
    );
  }

  @Patch(":id/username")
  updateUsername(
    @Param("id") id: string,
    @Body() dto: UpdateUserUsernameDto,
  ) {
    return this.usersService.updateUsername(
      id,
      dto.username,
    );
  }
}
