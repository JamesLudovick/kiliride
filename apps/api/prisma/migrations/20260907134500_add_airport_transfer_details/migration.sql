CREATE TYPE "AirportTransferType" AS ENUM (
  'ARRIVAL',
  'DEPARTURE'
);

ALTER TABLE "bookings"
ADD COLUMN "airportTransferType" "AirportTransferType",
ADD COLUMN "flightNumber" TEXT,
ADD COLUMN "airline" TEXT,
ADD COLUMN "airportTerminal" TEXT;
