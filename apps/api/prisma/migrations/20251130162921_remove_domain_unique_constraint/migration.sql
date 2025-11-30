-- DropIndex
DROP INDEX "public"."StripeCheckoutSession_domain_key";

-- AlterTable
ALTER TABLE "public"."StripeCheckoutSession" ALTER COLUMN "domain" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "StripeCheckoutSession_contactEmail_idx" ON "public"."StripeCheckoutSession"("contactEmail");
