/*
  Warnings:

  - A unique constraint covering the columns `[stripeLookupKey]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "stripeLookupKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeLookupKey_key" ON "public"."Plan"("stripeLookupKey");
