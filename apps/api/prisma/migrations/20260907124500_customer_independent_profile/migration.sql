-- Customer profiles can now exist independently from login accounts.

ALTER TABLE "customer_profiles"
ADD COLUMN "name" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "phone" TEXT;

-- Preserve existing registered-customer data.
UPDATE "customer_profiles" AS cp
SET
  "name" = u."name",
  "email" = u."email",
  "phone" = u."phone"
FROM "users" AS u
WHERE cp."userId" = u."id";

ALTER TABLE "customer_profiles"
ALTER COLUMN "name" SET NOT NULL;

ALTER TABLE "customer_profiles"
DROP CONSTRAINT "customer_profiles_userId_fkey";

ALTER TABLE "customer_profiles"
ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "customer_profiles"
ADD CONSTRAINT "customer_profiles_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "customer_profiles_name_idx"
ON "customer_profiles"("name");

CREATE INDEX "customer_profiles_email_idx"
ON "customer_profiles"("email");

CREATE INDEX "customer_profiles_phone_idx"
ON "customer_profiles"("phone");
