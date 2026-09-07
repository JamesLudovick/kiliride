CREATE TYPE "PaymentMethod" AS ENUM (
  'CASH',
  'MPESA',
  'AIRTEL_MONEY',
  'MIXX_BY_YAS',
  'BANK_TRANSFER',
  'CARD',
  'OTHER'
);

CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "reference" TEXT,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payments_bookingId_idx"
ON "payments"("bookingId");

CREATE INDEX "payments_paidAt_idx"
ON "payments"("paidAt");

ALTER TABLE "payments"
ADD CONSTRAINT "payments_bookingId_fkey"
FOREIGN KEY ("bookingId")
REFERENCES "bookings"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
