/*
  Warnings:

  - You are about to drop the column `contactLink` on the `catalogues` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `catalogues` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('WHATSAPP', 'INSTAGRAM', 'FACEBOOK');

-- AlterTable
ALTER TABLE "catalogues" DROP COLUMN "contactLink",
DROP COLUMN "phoneNumber",
ADD COLUMN     "contactMethod" "ContactMethod",
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUsername" TEXT,
ADD COLUMN     "storeLink" TEXT,
ADD COLUMN     "whatsappNumber" TEXT;
