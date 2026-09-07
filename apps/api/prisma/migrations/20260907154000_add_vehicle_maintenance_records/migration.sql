CREATE TYPE "MaintenanceType" AS ENUM (
  'ROUTINE_SERVICE',
  'REPAIR',
  'INSPECTION',
  'TYRE_SERVICE',
  'BATTERY',
  'BODYWORK',
  'OTHER'
);

CREATE TYPE "MaintenanceStatus" AS ENUM (
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE "maintenance_records" (
  "id" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "type" "MaintenanceType" NOT NULL,
  "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
  "serviceDate" TIMESTAMP(3) NOT NULL,
  "mileage" INTEGER,
  "cost" DECIMAL(12,2),
  "provider" TEXT,
  "description" TEXT,
  "nextServiceDate" TIMESTAMP(3),
  "nextServiceMileage" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "maintenance_records_pkey"
  PRIMARY KEY ("id")
);

CREATE INDEX "maintenance_records_vehicleId_idx"
ON "maintenance_records"("vehicleId");

CREATE INDEX "maintenance_records_status_idx"
ON "maintenance_records"("status");

CREATE INDEX "maintenance_records_serviceDate_idx"
ON "maintenance_records"("serviceDate");

CREATE INDEX "maintenance_records_nextServiceDate_idx"
ON "maintenance_records"("nextServiceDate");

ALTER TABLE "maintenance_records"
ADD CONSTRAINT "maintenance_records_vehicleId_fkey"
FOREIGN KEY ("vehicleId")
REFERENCES "vehicles"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
