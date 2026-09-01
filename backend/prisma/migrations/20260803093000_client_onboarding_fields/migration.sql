ALTER TABLE "clients"
ADD COLUMN "companyNameAsPerGstCertificate" TEXT NOT NULL DEFAULT '',
ADD COLUMN "gstCertificate" JSONB,
ADD COLUMN "seDetails" TEXT NOT NULL DEFAULT '',
ADD COLUMN "seCertificate" JSONB,
ADD COLUMN "natureOfWork" TEXT NOT NULL DEFAULT '',
ADD COLUMN "industryId" TEXT,
ADD COLUMN "appropriateGovernment" TEXT NOT NULL DEFAULT '';

CREATE INDEX "clients_industryId_idx" ON "clients"("industryId");

ALTER TABLE "clients"
ADD CONSTRAINT "clients_industryId_fkey"
FOREIGN KEY ("industryId") REFERENCES "industry_master"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
