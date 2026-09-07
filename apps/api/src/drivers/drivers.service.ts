import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DriverAvailability, UserRole } from "@prisma/client";
import { CreateDriverDto } from "./dto/create-driver.dto";
import { UpdateDriverAvailabilityDto } from "./dto/update-driver-availability.dto";
import { UpdateDriverDto } from "./dto/update-driver.dto";

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const drivers = await this.prisma.driverProfile.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return drivers.map((driver) => ({
      id: driver.id,
      userId: driver.userId,
      name: driver.user.name,
      email: driver.user.email,
      phone: driver.user.phone,
      licenseNumber: driver.licenseNumber,
      availability: driver.availability,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt
    }));
  }

  async findOne(id: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!driver) {
      throw new NotFoundException("Driver not found.");
    }

    return {
      id: driver.id,
      userId: driver.userId,
      name: driver.user.name,
      email: driver.user.email,
      phone: driver.user.phone,
      licenseNumber: driver.licenseNumber,
      availability: driver.availability,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt
    };
  }

  async create(dto: CreateDriverDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException(
        "An account with this email already exists."
      );
    }

    /*
     * Drivers are created without a password for now.
     * We will add proper driver authentication when we build
     * the driver portal.
     */
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim(),
        passwordHash: "",
        role: UserRole.DRIVER,
        driver: {
          create: {
            licenseNumber: dto.licenseNumber.trim(),
            availability: DriverAvailability.AVAILABLE
          }
        }
      },
      include: {
        driver: true
      }
    });

    if (!user.driver) {
      throw new ConflictException("Unable to create driver profile.");
    }

    return {
      id: user.driver.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      licenseNumber: user.driver.licenseNumber,
      availability: user.driver.availability,
      createdAt: user.driver.createdAt,
      updatedAt: user.driver.updatedAt
    };
  }

  async update(id: string, dto: UpdateDriverDto) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!driver) {
      throw new NotFoundException("Driver not found.");
    }

    const email = dto.email?.trim().toLowerCase();

    if (email && email !== driver.user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== driver.userId) {
        throw new ConflictException(
          "An account with this email already exists."
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: driver.userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(email !== undefined && { email }),
        ...(dto.phone !== undefined && { phone: dto.phone.trim() })
      }
    });

    const updatedDriver = await this.prisma.driverProfile.update({
      where: { id },
      data: {
        ...(dto.licenseNumber !== undefined && {
          licenseNumber: dto.licenseNumber.trim()
        })
      }
    });

    return {
      id: updatedDriver.id,
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      licenseNumber: updatedDriver.licenseNumber,
      availability: updatedDriver.availability,
      createdAt: updatedDriver.createdAt,
      updatedAt: updatedDriver.updatedAt
    };
  }

  async updateAvailability(
    id: string,
    dto: UpdateDriverAvailabilityDto
  ) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id }
    });

    if (!driver) {
      throw new NotFoundException("Driver not found.");
    }

    return this.prisma.driverProfile.update({
      where: { id },
      data: {
        availability: dto.availability
      },
      include: {
        user: true
      }
    });
  }
}
