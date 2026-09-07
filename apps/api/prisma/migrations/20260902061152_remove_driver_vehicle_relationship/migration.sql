/*
  Warnings:

  - The `availability` column on the `driver_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `driverId` on the `vehicles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DriverAvailability" AS ENUM ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED');

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_driverId_fkey";

-- DropIndex
DROP INDEX "vehicles_driverId_key";

-- AlterTable
ALTER TABLE "driver_profiles" DROP COLUMN "availability",
ADD COLUMN     "availability" "DriverAvailability" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "driverId";
