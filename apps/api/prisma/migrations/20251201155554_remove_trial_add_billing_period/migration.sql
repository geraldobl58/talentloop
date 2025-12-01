/*
  Warnings:

  - You are about to drop the column `trialDurationHours` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "trialDurationHours",
ADD COLUMN     "billingPeriodDays" INTEGER NOT NULL DEFAULT 30;
