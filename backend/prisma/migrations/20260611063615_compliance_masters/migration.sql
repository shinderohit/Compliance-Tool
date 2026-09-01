-- CreateTable
CREATE TABLE "StateMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "StateMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,

    CONSTRAINT "LocationMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawAreaMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LawAreaMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActRuleMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lawAreaId" TEXT NOT NULL,

    CONSTRAINT "ActRuleMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceMasterDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "actRuleId" TEXT NOT NULL,

    CONSTRAINT "ComplianceMasterDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StateMaster_name_key" ON "StateMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LawAreaMaster_name_key" ON "LawAreaMaster"("name");

-- AddForeignKey
ALTER TABLE "LocationMaster" ADD CONSTRAINT "LocationMaster_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "StateMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActRuleMaster" ADD CONSTRAINT "ActRuleMaster_lawAreaId_fkey" FOREIGN KEY ("lawAreaId") REFERENCES "LawAreaMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceMasterDefinition" ADD CONSTRAINT "ComplianceMasterDefinition_actRuleId_fkey" FOREIGN KEY ("actRuleId") REFERENCES "ActRuleMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
