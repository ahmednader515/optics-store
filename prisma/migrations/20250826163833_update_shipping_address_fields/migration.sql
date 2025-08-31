/*
  Warnings:

  - You are about to drop the column `city` on the `order_shipping_addresses` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `order_shipping_addresses` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `order_shipping_addresses` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `order_shipping_addresses` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `order_shipping_addresses` table. All the data in the column will be lost.

*/
-- AlterTable
-- First add the new columns as nullable
ALTER TABLE "order_shipping_addresses" ADD COLUMN "apartment" TEXT,
ADD COLUMN "area" TEXT,
ADD COLUMN "building" TEXT,
ADD COLUMN "floor" TEXT,
ADD COLUMN "landmark" TEXT;

-- Update existing records to set default values for area
UPDATE "order_shipping_addresses" SET "area" = 'القاهرة الجديدة' WHERE "area" IS NULL;

-- Make area column NOT NULL
ALTER TABLE "order_shipping_addresses" ALTER COLUMN "area" SET NOT NULL;

-- Now drop the old columns
ALTER TABLE "order_shipping_addresses" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "fullName",
DROP COLUMN "phone",
DROP COLUMN "postalCode";
