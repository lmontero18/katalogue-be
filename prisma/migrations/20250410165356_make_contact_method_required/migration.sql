/*
  Warnings:

  - Made the column `contactMethod` on table `catalogues` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
-- 👇 Este paso rellena todos los NULLs antes del cambio
UPDATE "catalogues" SET "contactMethod" = 'WHATSAPP' WHERE "contactMethod" IS NULL;

-- 👇 Ahora sí podemos hacer que sea NOT NULL
ALTER TABLE "catalogues" ALTER COLUMN "contactMethod" SET NOT NULL;

