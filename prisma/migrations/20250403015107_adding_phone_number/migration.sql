/*
  Warnings:

  - Added the required column `phoneNumber` to the `catalogues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "catalogues" ADD COLUMN     "phoneNumber" TEXT NOT NULL;
