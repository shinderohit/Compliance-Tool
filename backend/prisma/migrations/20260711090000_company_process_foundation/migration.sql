-- Company process foundation: profile fields, master data, multi-branch,
-- dashboard widgets, compliance items, notifications, and activities.

CREATE TABLE IF NOT EXISTS "industry_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "industry_master_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "business_type_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_type_master_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "department_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "department_master_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "designation_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "designation_master_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "compliance_frequency_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "compliance_frequency_master_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "authority_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "authority_master_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "regulatory_body_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "authorityId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "regulatory_body_master_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "regulatory_body_master_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "authority_master"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "holiday_calendar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "holiday_calendar_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "holidays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "calendarId" TEXT NOT NULL,
    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "holidays_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "holiday_calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "pan" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "gst" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "tan" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "cin" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "msme" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "iec" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "pf" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "esic" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "lwf" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "pt" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "factoryLicense" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "tradeLicense" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "industryId" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "businessTypeId" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "pincode" TEXT;

CREATE TABLE IF NOT EXISTS "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branches_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "branches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "compliance_uploads" ADD COLUMN IF NOT EXISTS "branchId" TEXT;

CREATE TABLE IF NOT EXISTS "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "employeeCode" TEXT,
    "companyId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "departmentId" TEXT,
    "designationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "employees_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "employees_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department_master"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "employees_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "designation_master"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "compliance_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "companyId" TEXT NOT NULL,
    "branchId" TEXT,
    "lawAreaId" TEXT,
    "frequencyId" TEXT,
    "authorityId" TEXT,
    "assignedToId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "riskLevel" TEXT,
    "complianceScore" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "nextDueDate" TIMESTAMP(3),
    "recurrencePattern" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "compliance_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "compliance_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "compliance_items_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "compliance_items_lawAreaId_fkey" FOREIGN KEY ("lawAreaId") REFERENCES "LawAreaMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "compliance_items_frequencyId_fkey" FOREIGN KEY ("frequencyId") REFERENCES "compliance_frequency_master"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "compliance_items_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "authority_master"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "compliance_items_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "attachments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "size" INTEGER,
    "complianceItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "attachments_complianceItemId_fkey" FOREIGN KEY ("complianceItemId") REFERENCES "compliance_items"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "approval_flows" (
    "id" TEXT NOT NULL,
    "complianceItemId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "approval_flows_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "approval_flows_complianceItemId_fkey" FOREIGN KEY ("complianceItemId") REFERENCES "compliance_items"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "audit_trails" (
    "id" TEXT NOT NULL,
    "complianceItemId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_trails_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_trails_complianceItemId_fkey" FOREIGN KEY ("complianceItemId") REFERENCES "compliance_items"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "activities" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdById" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "activities_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "activities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "industry_master_name_key" ON "industry_master"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "business_type_master_name_key" ON "business_type_master"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "department_master_name_key" ON "department_master"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "designation_master_name_key" ON "designation_master"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "compliance_frequency_master_name_key" ON "compliance_frequency_master"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "compliance_frequency_master_code_key" ON "compliance_frequency_master"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "authority_master_name_key" ON "authority_master"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "regulatory_body_master_name_key" ON "regulatory_body_master"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "holiday_calendar_name_year_key" ON "holiday_calendar"("name", "year");
CREATE UNIQUE INDEX IF NOT EXISTS "branches_code_key" ON "branches"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "employees_email_companyId_key" ON "employees"("email", "companyId");

CREATE INDEX IF NOT EXISTS "companies_clientId_idx" ON "companies"("clientId");
CREATE INDEX IF NOT EXISTS "branches_companyId_idx" ON "branches"("companyId");
CREATE INDEX IF NOT EXISTS "compliance_uploads_branchId_idx" ON "compliance_uploads"("branchId");
CREATE INDEX IF NOT EXISTS "employees_companyId_idx" ON "employees"("companyId");
CREATE INDEX IF NOT EXISTS "employees_branchId_idx" ON "employees"("branchId");
CREATE INDEX IF NOT EXISTS "compliance_items_companyId_idx" ON "compliance_items"("companyId");
CREATE INDEX IF NOT EXISTS "compliance_items_branchId_idx" ON "compliance_items"("branchId");
CREATE INDEX IF NOT EXISTS "compliance_items_status_idx" ON "compliance_items"("status");
CREATE INDEX IF NOT EXISTS "compliance_items_dueDate_idx" ON "compliance_items"("dueDate");
CREATE INDEX IF NOT EXISTS "notifications_companyId_idx" ON "notifications"("companyId");
CREATE INDEX IF NOT EXISTS "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX IF NOT EXISTS "activities_companyId_idx" ON "activities"("companyId");
CREATE INDEX IF NOT EXISTS "activities_type_idx" ON "activities"("type");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'companies_industryId_fkey'
    ) THEN
        ALTER TABLE "companies" ADD CONSTRAINT "companies_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "industry_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'companies_businessTypeId_fkey'
    ) THEN
        ALTER TABLE "companies" ADD CONSTRAINT "companies_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "business_type_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'compliance_uploads_branchId_fkey'
    ) THEN
        ALTER TABLE "compliance_uploads" ADD CONSTRAINT "compliance_uploads_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
