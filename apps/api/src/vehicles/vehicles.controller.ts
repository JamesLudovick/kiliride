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
import { CreateMaintenanceDto } from "./dto/create-maintenance.dto";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateMaintenanceStatusDto } from "./dto/update-maintenance-status.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { UpdateVehicleStatusDto } from "./dto/update-vehicle-status.dto";
import { VehiclesService } from "./vehicles.service";

@Controller("vehicles")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, dto);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateVehicleStatusDto,
  ) {
    return this.vehiclesService.updateStatus(id, dto);
  }

  @Post(":id/maintenance")
  createMaintenance(
    @Param("id") id: string,
    @Body() dto: CreateMaintenanceDto,
  ) {
    return this.vehiclesService.createMaintenance(
      id,
      dto,
    );
  }

  @Patch(":id/maintenance/:maintenanceId/status")
  updateMaintenanceStatus(
    @Param("id") id: string,
    @Param("maintenanceId") maintenanceId: string,
    @Body() dto: UpdateMaintenanceStatusDto,
  ) {
    return this.vehiclesService.updateMaintenanceStatus(
      id,
      maintenanceId,
      dto,
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.vehiclesService.remove(id);
  }
}
