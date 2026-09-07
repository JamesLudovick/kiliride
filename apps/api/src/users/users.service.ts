import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findCustomers(includeArchived = false) {
    return this.prisma.customerProfile.findMany({
      where: includeArchived
        ? undefined
        : {
            isArchived: false,
          },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            Booking: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  createCustomer(dto: CreateCustomerDto) {
    return this.prisma.customerProfile.create({
      data: {
        name: dto.name.trim(),
        email: dto.email?.trim().toLowerCase() || null,
        phone: dto.phone?.trim() || null,
        licenseNumber: dto.licenseNumber?.trim() || null,
        passportNumber: dto.passportNumber?.trim() || null,
        address: dto.address?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });
  }

  async updateCustomer(
    id: string,
    dto: UpdateCustomerDto,
  ) {
    const existing = await this.prisma.customerProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Customer not found.");
    }

    return this.prisma.customerProfile.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),
        ...(dto.email !== undefined && {
          email: dto.email.trim().toLowerCase() || null,
        }),
        ...(dto.phone !== undefined && {
          phone: dto.phone.trim() || null,
        }),
        ...(dto.licenseNumber !== undefined && {
          licenseNumber: dto.licenseNumber.trim() || null,
        }),
        ...(dto.passportNumber !== undefined && {
          passportNumber: dto.passportNumber.trim() || null,
        }),
        ...(dto.address !== undefined && {
          address: dto.address.trim() || null,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });
  }

  async archiveCustomer(id: string) {
    const existing = await this.prisma.customerProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Customer not found.");
    }

    return this.prisma.customerProfile.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });
  }

  async restoreCustomer(id: string) {
    const existing = await this.prisma.customerProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Customer not found.");
    }

    return this.prisma.customerProfile.update({
      where: { id },
      data: {
        isArchived: false,
        archivedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });
  }

}
