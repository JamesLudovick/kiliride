import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  BookingStatus,
  DriverAvailability,
  UserRole,
  VehicleStatus
} from "@prisma/client";
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

  async findPortalProfile(userId: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: {
        userId
      },
      include: {
        user: true
      }
    });

    if (!driver) {
      throw new NotFoundException("Driver profile not found.");
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

  async findPortalBookings(userId: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: {
        userId
      }
    });

    if (!driver) {
      throw new NotFoundException("Driver profile not found.");
    }

    return this.prisma.booking.findMany({
      where: {
        driverId: driver.id
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        vehicle: true,
        payments: {
          orderBy: {
            paidAt: "desc"
          }
        }
      },
      orderBy: {
        pickupDate: "asc"
      }
    });
  }

  async updatePortalBookingStatus(
    userId: string,
    bookingId: string,
    status: "IN_PROGRESS" | "COMPLETED"
  ) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: {
        userId
      }
    });

    if (!driver) {
      throw new NotFoundException("Driver profile not found.");
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        driverId: driver.id
      },
      include: {
        vehicle: true
      }
    });

    if (!booking) {
      throw new NotFoundException("Assigned booking not found.");
    }

    if (status === BookingStatus.IN_PROGRESS) {
      if (booking.status !== BookingStatus.ASSIGNED) {
        throw new BadRequestException(
          "Only an assigned booking can be started."
        );
      }

      if (!booking.vehicleId || !booking.vehicle) {
        throw new BadRequestException(
          "A vehicle must be assigned before starting the trip."
        );
      }

      if (booking.vehicle.status !== VehicleStatus.AVAILABLE) {
        throw new ConflictException(
          "The assigned vehicle is not currently available."
        );
      }

      const otherActiveTrip = await this.prisma.booking.findFirst({
        where: {
          id: {
            not: booking.id
          },
          driverId: driver.id,
          status: BookingStatus.IN_PROGRESS
        },
        select: {
          referenceNumber: true
        }
      });

      if (otherActiveTrip) {
        throw new ConflictException(
          `Complete ${otherActiveTrip.referenceNumber} before starting another trip.`
        );
      }

      await this.prisma.$transaction([
        this.prisma.booking.update({
          where: {
            id: booking.id
          },
          data: {
            status: BookingStatus.IN_PROGRESS
          }
        }),
        this.prisma.driverProfile.update({
          where: {
            id: driver.id
          },
          data: {
            availability: DriverAvailability.ON_TRIP
          }
        }),
        this.prisma.vehicle.update({
          where: {
            id: booking.vehicleId
          },
          data: {
            status: VehicleStatus.ON_TRIP
          }
        })
      ]);
    } else {
      if (booking.status !== BookingStatus.IN_PROGRESS) {
        throw new BadRequestException(
          "Only an in-progress booking can be completed."
        );
      }

      if (!booking.vehicleId) {
        throw new BadRequestException(
          "This trip has no assigned vehicle."
        );
      }

      await this.prisma.$transaction([
        this.prisma.booking.update({
          where: {
            id: booking.id
          },
          data: {
            status: BookingStatus.COMPLETED
          }
        }),
        this.prisma.driverProfile.update({
          where: {
            id: driver.id
          },
          data: {
            availability: DriverAvailability.AVAILABLE
          }
        }),
        this.prisma.vehicle.update({
          where: {
            id: booking.vehicleId
          },
          data: {
            status: VehicleStatus.AVAILABLE
          }
        })
      ]);
    }

    return this.prisma.booking.findUnique({
      where: {
        id: booking.id
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        vehicle: true,
        payments: {
          orderBy: {
            paidAt: "desc"
          }
        }
      }
    });
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
