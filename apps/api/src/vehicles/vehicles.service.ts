import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  MaintenanceStatus,
  Prisma,
  VehicleStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMaintenanceDto } from "./dto/create-maintenance.dto";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateMaintenanceStatusDto } from "./dto/update-maintenance-status.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { UpdateVehicleStatusDto } from "./dto/update-vehicle-status.dto";

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      include: {
        maintenanceRecords: {
          orderBy: {
            serviceDate: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        maintenanceRecords: {
          orderBy: {
            serviceDate: "desc",
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found.");
    }

    return vehicle;
  }

  async create(dto: CreateVehicleDto) {
    try {
      return await this.prisma.vehicle.create({
        data: {
          registrationNumber: dto.registrationNumber.trim().toUpperCase(),
          make: dto.make.trim(),
          model: dto.model.trim(),
          year: dto.year,
          color: dto.color?.trim() || null,
          currentMileage: dto.currentMileage ?? null,
          type: dto.type,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A vehicle with this registration number already exists.",
        );
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOne(id);

    try {
      return await this.prisma.vehicle.update({
        where: { id },
        data: {
          ...(dto.registrationNumber !== undefined && {
            registrationNumber: dto.registrationNumber.trim().toUpperCase(),
          }),
          ...(dto.make !== undefined && {
            make: dto.make.trim(),
          }),
          ...(dto.model !== undefined && {
            model: dto.model.trim(),
          }),
          ...(dto.year !== undefined && {
            year: dto.year,
          }),
          ...(dto.color !== undefined && {
            color: dto.color.trim() || null,
          }),
          ...(dto.currentMileage !== undefined && {
            currentMileage: dto.currentMileage,
          }),
          ...(dto.type !== undefined && {
            type: dto.type,
          }),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A vehicle with this registration number already exists.",
        );
      }

      throw error;
    }
  }

  async updateStatus(id: string, dto: UpdateVehicleStatusDto) {
    await this.findOne(id);

    if (dto.status === VehicleStatus.MAINTENANCE) {
      throw new ConflictException(
        "Start vehicle maintenance from the Maintenance workspace so the service history is recorded.",
      );
    }

    const activeMaintenance =
      await this.prisma.maintenanceRecord.findFirst({
        where: {
          vehicleId: id,
          status: MaintenanceStatus.IN_PROGRESS,
        },
        select: {
          id: true,
        },
      });

    if (activeMaintenance) {
      throw new ConflictException(
        "This vehicle has maintenance in progress and must remain in maintenance status.",
      );
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }

  async createMaintenance(
    vehicleId: string,
    dto: CreateMaintenanceDto,
  ) {
    const vehicle = await this.findOne(vehicleId);

    const status =
      dto.status ?? MaintenanceStatus.SCHEDULED;

    if (status === MaintenanceStatus.CANCELLED) {
      throw new ConflictException(
        "A new maintenance record cannot start as cancelled.",
      );
    }

    if (
      status === MaintenanceStatus.IN_PROGRESS &&
      vehicle.status === VehicleStatus.ON_TRIP
    ) {
      throw new ConflictException(
        "Maintenance cannot start while this vehicle is on a trip.",
      );
    }

    if (
      status === MaintenanceStatus.IN_PROGRESS &&
      vehicle.status === VehicleStatus.INACTIVE
    ) {
      throw new ConflictException(
        "Maintenance cannot start while this vehicle is inactive. Reactivate the vehicle first.",
      );
    }

    if (status === MaintenanceStatus.IN_PROGRESS) {
      const existing =
        await this.prisma.maintenanceRecord.findFirst({
          where: {
            vehicleId,
            status: MaintenanceStatus.IN_PROGRESS,
          },
          select: {
            id: true,
          },
        });

      if (existing) {
        throw new ConflictException(
          "This vehicle already has maintenance in progress.",
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.maintenanceRecord.create({
        data: {
          vehicleId,
          type: dto.type,
          status,
          serviceDate: new Date(dto.serviceDate),
          mileage: dto.mileage,
          cost:
            dto.cost !== undefined
              ? new Prisma.Decimal(dto.cost)
              : null,
          provider: dto.provider?.trim() || null,
          description:
            dto.description?.trim() || null,
          nextServiceDate: dto.nextServiceDate
            ? new Date(dto.nextServiceDate)
            : null,
          nextServiceMileage:
            dto.nextServiceMileage,
          notes: dto.notes?.trim() || null,
        },
      });

      if (status === MaintenanceStatus.IN_PROGRESS) {
        await tx.vehicle.update({
          where: {
            id: vehicleId,
          },
          data: {
            status: VehicleStatus.MAINTENANCE,
            ...(dto.mileage !== undefined &&
              (vehicle.currentMileage === null ||
                dto.mileage > vehicle.currentMileage) && {
                currentMileage: dto.mileage,
              }),
          },
        });
      }

      return record;
    });
  }

  async updateMaintenanceStatus(
    vehicleId: string,
    maintenanceId: string,
    dto: UpdateMaintenanceStatusDto,
  ) {
    const vehicle = await this.findOne(vehicleId);

    const record =
      await this.prisma.maintenanceRecord.findFirst({
        where: {
          id: maintenanceId,
          vehicleId,
        },
      });

    if (!record) {
      throw new NotFoundException(
        "Maintenance record not found.",
      );
    }

    const allowedTransitions: Record<
      MaintenanceStatus,
      MaintenanceStatus[]
    > = {
      [MaintenanceStatus.SCHEDULED]: [
        MaintenanceStatus.IN_PROGRESS,
        MaintenanceStatus.COMPLETED,
        MaintenanceStatus.CANCELLED,
      ],
      [MaintenanceStatus.IN_PROGRESS]: [
        MaintenanceStatus.COMPLETED,
        MaintenanceStatus.CANCELLED,
      ],
      [MaintenanceStatus.COMPLETED]: [],
      [MaintenanceStatus.CANCELLED]: [],
    };

    if (
      !allowedTransitions[record.status].includes(
        dto.status,
      )
    ) {
      throw new ConflictException(
        `Maintenance cannot move from ${record.status} to ${dto.status}.`,
      );
    }

    if (dto.status === MaintenanceStatus.IN_PROGRESS) {
      if (vehicle.status === VehicleStatus.ON_TRIP) {
        throw new ConflictException(
          "Maintenance cannot start while this vehicle is on a trip.",
        );
      }

      if (vehicle.status === VehicleStatus.INACTIVE) {
        throw new ConflictException(
          "Maintenance cannot start while this vehicle is inactive. Reactivate the vehicle first.",
        );
      }

      const otherActive =
        await this.prisma.maintenanceRecord.findFirst({
          where: {
            vehicleId,
            id: {
              not: maintenanceId,
            },
            status: MaintenanceStatus.IN_PROGRESS,
          },
          select: {
            id: true,
          },
        });

      if (otherActive) {
        throw new ConflictException(
          "This vehicle already has maintenance in progress.",
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated =
        await tx.maintenanceRecord.update({
          where: {
            id: maintenanceId,
          },
          data: {
            status: dto.status,
          },
        });

      if (dto.status === MaintenanceStatus.IN_PROGRESS) {
        await tx.vehicle.update({
          where: {
            id: vehicleId,
          },
          data: {
            status: VehicleStatus.MAINTENANCE,
          },
        });
      }

      if (
        record.status === MaintenanceStatus.IN_PROGRESS &&
        (
          dto.status === MaintenanceStatus.COMPLETED ||
          dto.status === MaintenanceStatus.CANCELLED
        )
      ) {
        const otherActive =
          await tx.maintenanceRecord.count({
            where: {
              vehicleId,
              id: {
                not: maintenanceId,
              },
              status: MaintenanceStatus.IN_PROGRESS,
            },
          });

        if (
          otherActive === 0 &&
          vehicle.status === VehicleStatus.MAINTENANCE
        ) {
          await tx.vehicle.update({
            where: {
              id: vehicleId,
            },
            data: {
              status: VehicleStatus.AVAILABLE,
            },
          });
        }
      }

      if (
        dto.status === MaintenanceStatus.COMPLETED &&
        record.mileage !== null &&
        (
          vehicle.currentMileage === null ||
          record.mileage > vehicle.currentMileage
        )
      ) {
        await tx.vehicle.update({
          where: {
            id: vehicleId,
          },
          data: {
            currentMileage: record.mileage,
          },
        });
      }

      return updated;
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.vehicle.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }
}
