/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- First, add phone column as nullable
ALTER TABLE "users" ADD COLUMN "phone" TEXT;

-- Populate phone column with unique values for existing users
UPDATE "users" SET "phone" = '+966501234567' WHERE id = (SELECT id FROM "users" LIMIT 1);
UPDATE "users" SET "phone" = '+966501234568' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 1);
UPDATE "users" SET "phone" = '+966501234569' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 2);
UPDATE "users" SET "phone" = '+966501234570' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 3);
UPDATE "users" SET "phone" = '+966501234571' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 4);
UPDATE "users" SET "phone" = '+966501234572' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 5);
UPDATE "users" SET "phone" = '+966501234573' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 6);
UPDATE "users" SET "phone" = '+966501234574' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 7);
UPDATE "users" SET "phone" = '+966501234575' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 8);
UPDATE "users" SET "phone" = '+966501234576' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 9);
UPDATE "users" SET "phone" = '+966501234577' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 10);
UPDATE "users" SET "phone" = '+966501234578' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 11);
UPDATE "users" SET "phone" = '+966501234579' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 12);
UPDATE "users" SET "phone" = '+966501234580' WHERE id = (SELECT id FROM "users" LIMIT 1 OFFSET 13);

-- Now make phone column required
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "emailVerified";

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
