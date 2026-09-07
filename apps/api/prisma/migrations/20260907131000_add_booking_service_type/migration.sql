CREATE TYPE "ServiceType" AS ENUM (
  'AIRPORT_TRANSFER',
  'SELF_DRIVE',
  'CHAUFFEUR',
  'SAFARI',
  'CORPORATE',
  'WEDDING_EVENT',
  'OTHER'
);

ALTER TABLE "bookings"
ADD COLUMN "serviceType" "ServiceType" NOT NULL DEFAULT 'OTHER';

CREATE INDEX "bookings_serviceType_idx"
ON "bookings"("serviceType");
