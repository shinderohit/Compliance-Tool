ALTER TABLE "ComplianceMaster" ADD COLUMN IF NOT EXISTS "branchId" TEXT;

CREATE INDEX IF NOT EXISTS "ComplianceMaster_companyId_idx" ON "ComplianceMaster"("companyId");
CREATE INDEX IF NOT EXISTS "ComplianceMaster_branchId_idx" ON "ComplianceMaster"("branchId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ComplianceMaster_branchId_fkey'
    ) THEN
        ALTER TABLE "ComplianceMaster"
            ADD CONSTRAINT "ComplianceMaster_branchId_fkey"
            FOREIGN KEY ("branchId") REFERENCES "branches"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
