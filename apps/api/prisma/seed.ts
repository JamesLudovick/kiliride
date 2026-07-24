import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@kiliride.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "AdminPassword123";
  const name = process.env.SEED_ADMIN_NAME ?? "KiliRide Admin";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: UserRole.ADMIN,
      status: "ACTIVE"
    },
    create: {
      name,
      email,
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  console.log(`Seeded admin user: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
