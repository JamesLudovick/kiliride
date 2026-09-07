import * as bcrypt from "bcrypt";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAccounts() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        {
          role: "asc",
        },
        {
          name: "asc",
        },
      ],
    });
  }

  async updateUsername(
    id: string,
    username: string,
  ) {
    const normalizedUsername =
      username.trim().toLowerCase();

    const account =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!account) {
      throw new NotFoundException(
        "User account not found.",
      );
    }

    const existingUsername =
      await this.prisma.user.findUnique({
        where: {
          username: normalizedUsername,
        },
        select: {
          id: true,
        },
      });

    if (
      existingUsername &&
      existingUsername.id !== id
    ) {
      throw new ConflictException(
        "This username is already in use.",
      );
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        username: normalizedUsername,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async resetPassword(
    id: string,
    password: string,
  ) {
    const existing =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        "User account not found.",
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id,
        },
        data: {
          passwordHash,
        },
      }),

      this.prisma.session.deleteMany({
        where: {
          userId: id,
        },
      }),
    ]);

    return {
      success: true,
      message:
        "Password reset successfully.",
    };
  }


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
