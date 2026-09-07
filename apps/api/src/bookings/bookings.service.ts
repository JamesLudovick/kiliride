import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BookingStatus,
  DriverAvailability,
  Prisma,
  ServiceType,
  VehicleStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { UpdateBookingStatusDto } from "./dto/update-booking-status.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeServiceType(serviceType: ServiceType) {
    return serviceType;
  }

  private async ensureCustomer(customerId: string) {
    const customer = await this.prisma.customerProfile.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found.");
    }

    return customer;
  }

  private async ensureDriverAvailable(
    driverId: string,
    pickupDate: Date,
    dropoffDate: Date,
    bookingId?: string,
  ) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException("Driver not found.");
    }

    if (driver.availability !== DriverAvailability.AVAILABLE) {
      throw new ConflictException(
        "This driver is not currently available.",
      );
    }

    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        driverId,
        id: bookingId ? { not: bookingId } : undefined,
        status: {
          notIn: [
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
          ],
        },
        pickupDate: {
          lt: dropoffDate,
        },
        dropoffDate: {
          gt: pickupDate,
        },
      },
      select: {
        id: true,
        referenceNumber: true,
      },
    });

    if (activeBooking) {
      throw new ConflictException(
        `This driver is already assigned to booking ${activeBooking.referenceNumber} during this time.`,
      );
    }

    return driver;
  }

  private async ensureVehicleAvailable(
    vehicleId: string,
    pickupDate: Date,
    dropoffDate: Date,
    bookingId?: string,
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found.");
    }

    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new ConflictException(
        "This vehicle is not currently available.",
      );
    }

    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        vehicleId,
        id: bookingId ? { not: bookingId } : undefined,
        status: {
          notIn: [
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
          ],
        },
        pickupDate: {
          lt: dropoffDate,
        },
        dropoffDate: {
          gt: pickupDate,
        },
      },
      select: {
        id: true,
        referenceNumber: true,
      },
    });

    if (activeBooking) {
      throw new ConflictException(
        `This vehicle is already assigned to booking ${activeBooking.referenceNumber} during this time.`,
      );
    }

    return vehicle;
  }

  private buildReferenceNumber() {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();

    return `KR-${stamp}-${random}`;
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        vehicle: true,
      },
      orderBy: {
        pickupDate: "asc",
      },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        vehicle: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found.");
    }

    return booking;
  }

  async create(dto: CreateBookingDto): Promise<Prisma.BookingGetPayload<{}>> {
    await this.ensureCustomer(dto.customerId);

    const pickupDate = new Date(dto.pickupDate);
    const dropoffDate = new Date(dto.dropoffDate);

    if (dropoffDate <= pickupDate) {
      throw new BadRequestException(
        "Drop-off date must be after pickup date.",
      );
    }

    if (dto.driverId) {
      await this.ensureDriverAvailable(
        dto.driverId,
        pickupDate,
        dropoffDate,
      );
    }

    if (dto.vehicleId) {
      await this.ensureVehicleAvailable(
        dto.vehicleId,
        pickupDate,
        dropoffDate,
      );
    }

    try {
      return await this.prisma.booking.create({
        data: {
          referenceNumber: this.buildReferenceNumber(),
          customerId: dto.customerId,
          driverId: dto.driverId,
          vehicleId: dto.vehicleId,
          pickupLocation: dto.pickupLocation.trim(),
          destination: dto.destination.trim(),
          pickupDate,
          dropoffDate,
          passengerCount: dto.passengerCount,
          fare: new Prisma.Decimal(dto.fare),
          serviceType: this.normalizeServiceType(dto.serviceType),

          airportTransferType:
            dto.serviceType === ServiceType.AIRPORT_TRANSFER
              ? dto.airportTransferType
              : null,

          flightNumber:
            dto.serviceType === ServiceType.AIRPORT_TRANSFER
              ? dto.flightNumber?.trim() || null
              : null,

          airline:
            dto.serviceType === ServiceType.AIRPORT_TRANSFER
              ? dto.airline?.trim() || null
              : null,

          airportTerminal:
            dto.serviceType === ServiceType.AIRPORT_TRANSFER
              ? dto.airportTerminal?.trim() || null
              : null,

          notes: dto.notes?.trim() || null,
          status: BookingStatus.PENDING,
        },
        include: {
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          driver: true,
          vehicle: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return this.create(dto);
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateBookingDto) {
    const existing = await this.findOne(id);

    if (
      existing.status === BookingStatus.IN_PROGRESS ||
      existing.status === BookingStatus.COMPLETED ||
      existing.status === BookingStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "In-progress, completed or cancelled bookings cannot be edited.",
      );
    }

    if (dto.customerId) {
      await this.ensureCustomer(dto.customerId);
    }

    const pickupDate =
      dto.pickupDate !== undefined
        ? new Date(dto.pickupDate)
        : existing.pickupDate;

    const dropoffDate =
      dto.dropoffDate !== undefined
        ? new Date(dto.dropoffDate)
        : existing.dropoffDate;

    if (dropoffDate <= pickupDate) {
      throw new BadRequestException(
        "Drop-off date must be after pickup date.",
      );
    }

    const resultingDriverId =
      dto.driverId !== undefined
        ? dto.driverId || null
        : existing.driverId;

    const resultingVehicleId =
      dto.vehicleId !== undefined
        ? dto.vehicleId || null
        : existing.vehicleId;

    if (
      existing.status === BookingStatus.ASSIGNED &&
      (!resultingDriverId || !resultingVehicleId)
    ) {
      throw new BadRequestException(
        "An assigned booking must have both a driver and vehicle.",
      );
    }

    if (dto.driverId) {
      await this.ensureDriverAvailable(
        dto.driverId,
        pickupDate,
        dropoffDate,
        id,
      );
    }

    if (dto.vehicleId) {
      await this.ensureVehicleAvailable(
        dto.vehicleId,
        pickupDate,
        dropoffDate,
        id,
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        ...(dto.customerId !== undefined && {
          customerId: dto.customerId,
        }),
        ...(dto.driverId !== undefined && {
          driverId: dto.driverId || null,
        }),
        ...(dto.vehicleId !== undefined && {
          vehicleId: dto.vehicleId || null,
        }),
        ...(dto.pickupLocation !== undefined && {
          pickupLocation: dto.pickupLocation.trim(),
        }),
        ...(dto.destination !== undefined && {
          destination: dto.destination.trim(),
        }),
        ...(dto.pickupDate !== undefined && {
          pickupDate,
        }),
        ...(dto.dropoffDate !== undefined && {
          dropoffDate,
        }),
        ...(dto.passengerCount !== undefined && {
          passengerCount: dto.passengerCount,
        }),
        ...(dto.fare !== undefined && {
          fare: new Prisma.Decimal(dto.fare),
        }),
        ...(dto.serviceType !== undefined && {
          serviceType: this.normalizeServiceType(dto.serviceType),
        }),

        ...(dto.airportTransferType !== undefined && {
          airportTransferType: dto.airportTransferType,
        }),

        ...(dto.flightNumber !== undefined && {
          flightNumber: dto.flightNumber.trim() || null,
        }),

        ...(dto.airline !== undefined && {
          airline: dto.airline.trim() || null,
        }),

        ...(dto.airportTerminal !== undefined && {
          airportTerminal: dto.airportTerminal.trim() || null,
        }),

        ...(dto.notes !== undefined && {
          notes: dto.notes.trim() || null,
        }),
      },
      include: {
        customer: true,
        driver: true,
        vehicle: true,
      },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateBookingStatusDto,
  ) {
    const booking = await this.findOne(id);

    const allowedTransitions: Record<
      BookingStatus,
      BookingStatus[]
    > = {
      [BookingStatus.PENDING]: [
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
      ],

      [BookingStatus.CONFIRMED]: [
        BookingStatus.ASSIGNED,
        BookingStatus.CANCELLED,
      ],

      [BookingStatus.ASSIGNED]: [
        BookingStatus.IN_PROGRESS,
        BookingStatus.CANCELLED,
      ],

      [BookingStatus.IN_PROGRESS]: [
        BookingStatus.COMPLETED,
      ],

      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
    };

    const allowed =
      allowedTransitions[booking.status].includes(dto.status);

    if (!allowed) {
      throw new BadRequestException(
        `Booking cannot move from ${booking.status} to ${dto.status}.`,
      );
    }

    if (
      dto.status === BookingStatus.ASSIGNED ||
      dto.status === BookingStatus.IN_PROGRESS
    ) {
      if (!booking.driverId) {
        throw new BadRequestException(
          "A driver must be assigned before this booking can continue.",
        );
      }

      if (!booking.vehicleId) {
        throw new BadRequestException(
          "A vehicle must be assigned before this booking can continue.",
        );
      }

      await this.ensureDriverAvailable(
        booking.driverId,
        booking.pickupDate,
        booking.dropoffDate,
        booking.id,
      );

      await this.ensureVehicleAvailable(
        booking.vehicleId,
        booking.pickupDate,
        booking.dropoffDate,
        booking.id,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: dto.status,
        },
      });

      if (dto.status === BookingStatus.IN_PROGRESS) {
        await tx.driverProfile.update({
          where: { id: booking.driverId! },
          data: {
            availability: DriverAvailability.ON_TRIP,
          },
        });

        await tx.vehicle.update({
          where: { id: booking.vehicleId! },
          data: {
            status: VehicleStatus.ON_TRIP,
          },
        });
      }

      if (dto.status === BookingStatus.COMPLETED) {
        await tx.driverProfile.update({
          where: { id: booking.driverId! },
          data: {
            availability: DriverAvailability.AVAILABLE,
          },
        });

        await tx.vehicle.update({
          where: { id: booking.vehicleId! },
          data: {
            status: VehicleStatus.AVAILABLE,
          },
        });
      }

      return updated;
    });
  }

  async updatePaymentStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
  ) {
    await this.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: {
        paymentStatus: dto.paymentStatus,
      },
    });
  }

  async cancel(id: string) {
    return this.updateStatus(id, {
      status: BookingStatus.CANCELLED,
    });
  }
}
