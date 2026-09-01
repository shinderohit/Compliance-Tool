ALTER TABLE "ComplianceMaster" ADD COLUMN "companyName" TEXT;
ALTER TABLE "ComplianceMaster" ADD COLUMN "gstNumber" TEXT;
ALTER TABLE "ComplianceMaster" ADD COLUMN "panNumber" TEXT;
ALTER TABLE "ComplianceMaster" ADD COLUMN "complianceType" TEXT;
ALTER TABLE "ComplianceMaster" ADD COLUMN "expiryDate" TIMESTAMP(3);
ALTER TABLE "ComplianceMaster" ADD COLUMN "registrations" JSONB;
ALTER TABLE "ComplianceMaster" ADD COLUMN "documents" JSONB;
ALTER TABLE "ComplianceMaster" ADD COLUMN "branches" JSONB;
