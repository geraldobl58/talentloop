-- CreateEnum
CREATE TYPE "public"."SubStatus" AS ENUM ('ACTIVE', 'PENDING', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."SubscriptionAction" AS ENUM ('CREATED', 'UPGRADED', 'DOWNGRADED', 'RENEWED', 'CANCELED', 'REACTIVATED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'APPLIED', 'VIEWED', 'INTERVIEW', 'ASSESSMENT', 'OFFER', 'REJECTED', 'HIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."QueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('NEW_JOB', 'APPLICATION_UPDATE', 'INTERVIEW_REMINDER', 'FOLLOW_UP', 'MATCH_FOUND', 'AUTO_APPLY_STATUS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('EMAIL', 'LINKEDIN', 'WHATSAPP', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'OPENED', 'REPLIED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "description" TEXT,
    "maxUsers" INTEGER,
    "maxContacts" INTEGER,
    "hasAPI" BOOLEAN NOT NULL DEFAULT false,
    "trialDurationHours" INTEGER DEFAULT 168,
    "maxJobsPerDay" INTEGER DEFAULT 50,
    "maxApplicationsPerDay" INTEGER DEFAULT 10,
    "maxAutoApplyPerDay" INTEGER DEFAULT 5,
    "hasAIMatching" BOOLEAN NOT NULL DEFAULT false,
    "hasAutoApply" BOOLEAN NOT NULL DEFAULT false,
    "hasRecruiterCRM" BOOLEAN NOT NULL DEFAULT false,
    "hasPrioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "public"."SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "renewedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "action" "public"."SubscriptionAction" NOT NULL,
    "previousPlanId" TEXT,
    "previousPlanName" TEXT,
    "previousPlanPrice" DOUBLE PRECISION,
    "previousExpiresAt" TIMESTAMP(3),
    "newPlanId" TEXT,
    "newPlanName" TEXT,
    "newPlanPrice" DOUBLE PRECISION,
    "newExpiresAt" TIMESTAMP(3),
    "reason" TEXT,
    "notes" TEXT,
    "triggeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "limitType" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StripeCheckoutSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "successToken" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeCheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "companyLogo" TEXT,
    "companyUrl" TEXT,
    "location" TEXT,
    "modality" TEXT,
    "seniority" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT DEFAULT 'BRL',
    "recruiterName" TEXT,
    "recruiterEmail" TEXT,
    "recruiterLinkedin" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "website" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "portfolio" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cvUrl" TEXT,
    "cvLastUpdated" TIMESTAMP(3),
    "openToWork" BOOLEAN NOT NULL DEFAULT true,
    "availableFrom" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modalities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seniorities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "companies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludeCompanies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "salaryMin" INTEGER,
    "salaryCurrency" TEXT DEFAULT 'BRL',
    "autoApplyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailyLimit" INTEGER DEFAULT 20,
    "autoApplyHours" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notifyNewJobs" BOOLEAN NOT NULL DEFAULT true,
    "notifyMatches" BOOLEAN NOT NULL DEFAULT true,
    "notifyApplications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "matchScore" INTEGER,
    "matchNotes" TEXT,
    "coverLetter" TEXT,
    "cvUsed" TEXT,
    "customAnswers" JSONB,
    "autoApplied" BOOLEAN NOT NULL DEFAULT false,
    "followUpAt" TIMESTAMP(3),
    "followUpDone" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "salary" INTEGER,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobMatch" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "suggestions" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skillsMatch" INTEGER,
    "experienceMatch" INTEGER,
    "locationMatch" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScraperQueue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" "public"."QueueStatus" NOT NULL DEFAULT 'PENDING',
    "searchQuery" TEXT,
    "filters" JSONB,
    "jobsFound" INTEGER,
    "jobsAdded" INTEGER,
    "errorMessage" TEXT,
    "errorDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ScraperQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Experience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "companyLogo" TEXT,
    "location" TEXT,
    "description" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Education" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SavedJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "notes" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoverLetterTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverLetterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecruiterContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "company" TEXT,
    "position" TEXT,
    "notes" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUp" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecruiterMessage" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" "public"."MessageType" NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" "public"."MessageStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "jobId" TEXT,
    "jobTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "public"."Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_deletedAt_idx" ON "public"."Tenant"("deletedAt");

-- CreateIndex
CREATE INDEX "User_tenantId_isActive_idx" ON "public"."User"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "public"."User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "public"."User"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "public"."PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_token_idx" ON "public"."PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_createdAt_idx" ON "public"."PasswordReset"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeProductId_key" ON "public"."Plan"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "public"."Plan"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "public"."Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tenantId_key" ON "public"."Subscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "public"."Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "public"."Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_tenantId_idx" ON "public"."SubscriptionHistory"("tenantId");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_subscriptionId_idx" ON "public"."SubscriptionHistory"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_action_idx" ON "public"."SubscriptionHistory"("action");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_createdAt_idx" ON "public"."SubscriptionHistory"("createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_tenantId_createdAt_idx" ON "public"."SubscriptionHistory"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_tenantId_type_limitType_sentAt_idx" ON "public"."EmailLog"("tenantId", "type", "limitType", "sentAt");

-- CreateIndex
CREATE INDEX "EmailLog_sentAt_idx" ON "public"."EmailLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCheckoutSession_sessionId_key" ON "public"."StripeCheckoutSession"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCheckoutSession_successToken_key" ON "public"."StripeCheckoutSession"("successToken");

-- CreateIndex
CREATE INDEX "StripeCheckoutSession_sessionId_idx" ON "public"."StripeCheckoutSession"("sessionId");

-- CreateIndex
CREATE INDEX "StripeCheckoutSession_stripeCustomerId_idx" ON "public"."StripeCheckoutSession"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "StripeCheckoutSession_successToken_idx" ON "public"."StripeCheckoutSession"("successToken");

-- CreateIndex
CREATE INDEX "StripeCheckoutSession_createdAt_idx" ON "public"."StripeCheckoutSession"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCheckoutSession_domain_key" ON "public"."StripeCheckoutSession"("domain");

-- CreateIndex
CREATE INDEX "Job_tenantId_source_idx" ON "public"."Job"("tenantId", "source");

-- CreateIndex
CREATE INDEX "Job_tenantId_isActive_idx" ON "public"."Job"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "Job_title_company_idx" ON "public"."Job"("title", "company");

-- CreateIndex
CREATE INDEX "Job_tags_idx" ON "public"."Job"("tags");

-- CreateIndex
CREATE INDEX "Job_skills_idx" ON "public"."Job"("skills");

-- CreateIndex
CREATE INDEX "Job_postedAt_idx" ON "public"."Job"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Job_tenantId_externalId_key" ON "public"."Job"("tenantId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "public"."Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_openToWork_idx" ON "public"."Profile"("openToWork");

-- CreateIndex
CREATE UNIQUE INDEX "JobPreference_userId_key" ON "public"."JobPreference"("userId");

-- CreateIndex
CREATE INDEX "JobPreference_userId_idx" ON "public"."JobPreference"("userId");

-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "public"."Application"("userId", "status");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "public"."Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_appliedAt_idx" ON "public"."Application"("appliedAt");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "public"."Application"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_userId_key" ON "public"."Application"("jobId", "userId");

-- CreateIndex
CREATE INDEX "ApplicationLog_applicationId_idx" ON "public"."ApplicationLog"("applicationId");

-- CreateIndex
CREATE INDEX "JobMatch_userId_idx" ON "public"."JobMatch"("userId");

-- CreateIndex
CREATE INDEX "JobMatch_jobId_idx" ON "public"."JobMatch"("jobId");

-- CreateIndex
CREATE INDEX "JobMatch_score_idx" ON "public"."JobMatch"("score");

-- CreateIndex
CREATE UNIQUE INDEX "JobMatch_jobId_userId_key" ON "public"."JobMatch"("jobId", "userId");

-- CreateIndex
CREATE INDEX "ScraperQueue_tenantId_status_idx" ON "public"."ScraperQueue"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ScraperQueue_status_idx" ON "public"."ScraperQueue"("status");

-- CreateIndex
CREATE INDEX "ScraperQueue_createdAt_idx" ON "public"."ScraperQueue"("createdAt");

-- CreateIndex
CREATE INDEX "Experience_profileId_idx" ON "public"."Experience"("profileId");

-- CreateIndex
CREATE INDEX "Experience_startDate_idx" ON "public"."Experience"("startDate");

-- CreateIndex
CREATE INDEX "Education_profileId_idx" ON "public"."Education"("profileId");

-- CreateIndex
CREATE INDEX "SavedJob_userId_idx" ON "public"."SavedJob"("userId");

-- CreateIndex
CREATE INDEX "SavedJob_savedAt_idx" ON "public"."SavedJob"("savedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "public"."SavedJob"("userId", "jobId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "public"."Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "CoverLetterTemplate_userId_idx" ON "public"."CoverLetterTemplate"("userId");

-- CreateIndex
CREATE INDEX "RecruiterContact_userId_idx" ON "public"."RecruiterContact"("userId");

-- CreateIndex
CREATE INDEX "RecruiterContact_company_idx" ON "public"."RecruiterContact"("company");

-- CreateIndex
CREATE INDEX "RecruiterContact_lastContactAt_idx" ON "public"."RecruiterContact"("lastContactAt");

-- CreateIndex
CREATE INDEX "RecruiterMessage_contactId_idx" ON "public"."RecruiterMessage"("contactId");

-- CreateIndex
CREATE INDEX "RecruiterMessage_status_idx" ON "public"."RecruiterMessage"("status");

-- CreateIndex
CREATE INDEX "RecruiterMessage_sentAt_idx" ON "public"."RecruiterMessage"("sentAt");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPreference" ADD CONSTRAINT "JobPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationLog" ADD CONSTRAINT "ApplicationLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobMatch" ADD CONSTRAINT "JobMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobMatch" ADD CONSTRAINT "JobMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScraperQueue" ADD CONSTRAINT "ScraperQueue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Experience" ADD CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoverLetterTemplate" ADD CONSTRAINT "CoverLetterTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecruiterContact" ADD CONSTRAINT "RecruiterContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecruiterMessage" ADD CONSTRAINT "RecruiterMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."RecruiterContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
