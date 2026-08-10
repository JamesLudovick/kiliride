import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, VehicleStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { UpdateVehicleStatusDto } from "./dto/update-vehicle-status.dto";

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
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

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        status: dto.status,
      },
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
