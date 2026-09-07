import { Module } from "@nestjs/common";
import { DriversController } from "./drivers.controller";
import { DriverPortalController } from "./driver-portal.controller";
import { DriversService } from "./drivers.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DriversController, DriverPortalController],
  providers: [DriversService],
  exports: [DriversService]
})
export class DriversModule {}
