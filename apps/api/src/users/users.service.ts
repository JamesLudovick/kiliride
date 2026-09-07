import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }
  findCustomers() {
    return this.prisma.customerProfile.findMany({
      where: {
        user: {
          role: "CUSTOMER",
          status: "ACTIVE",
        },
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
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });
  }

}
