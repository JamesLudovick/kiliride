ALTER TABLE "customer_profiles"
ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "customer_profiles_isArchived_idx"
ON "customer_profiles"("isArchived");
