-- CreateEnum
CREATE TYPE "public"."TenantType" AS ENUM ('CANDIDATE', 'COMPANY');

-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "type" "public"."TenantType" NOT NULL DEFAULT 'CANDIDATE';

-- CreateIndex
CREATE INDEX "Tenant_type_idx" ON "public"."Tenant"("type");
