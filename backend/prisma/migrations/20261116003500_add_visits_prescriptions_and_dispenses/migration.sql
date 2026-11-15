-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('DRAFT', 'ISSUED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DispenseStatus" AS ENUM ('COMPLETED', 'REVERSED');

-- CreateEnum
CREATE TYPE "StockMovementReason" AS ENUM ('OPENING_BALANCE', 'RECEIPT', 'ADJUSTMENT', 'DISPENSE', 'DISPENSE_REVERSAL');

-- CreateTable
CREATE TABLE "Visit" (
    "id" UUID NOT NULL,
    "doctorId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "status" "VisitStatus" NOT NULL,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" UUID NOT NULL,
    "visitId" UUID NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'DRAFT',
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "replacesId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" UUID NOT NULL,
    "prescriptionId" UUID NOT NULL,
    "medicineId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dosageInstructions" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "strength" TEXT,
    "form" TEXT,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionAccess" (
    "id" UUID NOT NULL,
    "prescriptionId" UUID NOT NULL,
    "manualCodeHash" TEXT NOT NULL,
    "manualCodeEncrypted" TEXT NOT NULL,
    "qrTokenHash" TEXT NOT NULL,
    "qrTokenEncrypted" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescriptionAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispense" (
    "id" UUID NOT NULL,
    "prescriptionId" UUID NOT NULL,
    "pharmacyId" UUID NOT NULL,
    "status" "DispenseStatus" NOT NULL DEFAULT 'COMPLETED',
    "dispensedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversedAt" TIMESTAMP(3),
    "reversalReason" TEXT,

    CONSTRAINT "Dispense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispenseItem" (
    "id" UUID NOT NULL,
    "dispenseId" UUID NOT NULL,
    "prescriptionId" UUID NOT NULL,
    "prescriptionItemId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "DispenseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" UUID NOT NULL,
    "pharmacyId" UUID NOT NULL,
    "medicineId" UUID NOT NULL,
    "quantityDelta" INTEGER NOT NULL,
    "reason" "StockMovementReason" NOT NULL,
    "dispenseItemId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Visit_doctorId_startedAt_idx" ON "Visit"("doctorId", "startedAt");

-- CreateIndex
CREATE INDEX "Visit_patientId_startedAt_idx" ON "Visit"("patientId", "startedAt");

-- CreateIndex
CREATE INDEX "Prescription_visitId_status_idx" ON "Prescription"("visitId", "status");

-- CreateIndex
CREATE INDEX "Prescription_replacesId_idx" ON "Prescription"("replacesId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_medicineId_idx" ON "PrescriptionItem"("medicineId");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionItem_prescriptionId_medicineId_key" ON "PrescriptionItem"("prescriptionId", "medicineId");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionItem_id_prescriptionId_key" ON "PrescriptionItem"("id", "prescriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionAccess_manualCodeHash_key" ON "PrescriptionAccess"("manualCodeHash");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionAccess_qrTokenHash_key" ON "PrescriptionAccess"("qrTokenHash");

-- CreateIndex
CREATE INDEX "PrescriptionAccess_prescriptionId_revokedAt_idx" ON "PrescriptionAccess"("prescriptionId", "revokedAt");

-- CreateIndex
CREATE INDEX "Dispense_prescriptionId_dispensedAt_idx" ON "Dispense"("prescriptionId", "dispensedAt");

-- CreateIndex
CREATE INDEX "Dispense_pharmacyId_dispensedAt_idx" ON "Dispense"("pharmacyId", "dispensedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Dispense_id_prescriptionId_key" ON "Dispense"("id", "prescriptionId");

-- CreateIndex
CREATE INDEX "DispenseItem_prescriptionItemId_idx" ON "DispenseItem"("prescriptionItemId");

-- CreateIndex
CREATE UNIQUE INDEX "DispenseItem_dispenseId_prescriptionItemId_key" ON "DispenseItem"("dispenseId", "prescriptionItemId");

-- CreateIndex
CREATE INDEX "StockMovement_pharmacyId_medicineId_createdAt_idx" ON "StockMovement"("pharmacyId", "medicineId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_dispenseItemId_idx" ON "StockMovement"("dispenseItemId");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_replacesId_fkey" FOREIGN KEY ("replacesId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionAccess" ADD CONSTRAINT "PrescriptionAccess_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispense" ADD CONSTRAINT "Dispense_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispense" ADD CONSTRAINT "Dispense_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "PharmacyProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispenseItem" ADD CONSTRAINT "DispenseItem_dispenseId_prescriptionId_fkey" FOREIGN KEY ("dispenseId", "prescriptionId") REFERENCES "Dispense"("id", "prescriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispenseItem" ADD CONSTRAINT "DispenseItem_prescriptionItemId_prescriptionId_fkey" FOREIGN KEY ("prescriptionItemId", "prescriptionId") REFERENCES "PrescriptionItem"("id", "prescriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "PharmacyProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_dispenseItemId_fkey" FOREIGN KEY ("dispenseItemId") REFERENCES "DispenseItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Existing doctor/patient accounts may predate automatic profile creation.
INSERT INTO "DoctorProfile" ("userId")
SELECT "id" FROM "User" WHERE "role" = 'DOCTOR'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "PatientProfile" ("userId")
SELECT "id" FROM "User" WHERE "role" = 'PATIENT'
ON CONFLICT ("userId") DO NOTHING;

-- Keep one usable code/QR pair per prescription. Rotation revokes the old pair first.
CREATE UNIQUE INDEX "PrescriptionAccess_one_active_per_prescription"
ON "PrescriptionAccess" ("prescriptionId") WHERE "revokedAt" IS NULL;

-- Protect basic clinical and stock quantities at the database boundary.
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_end_after_start"
CHECK ("endedAt" IS NULL OR ("startedAt" IS NOT NULL AND "endedAt" >= "startedAt"));
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_started_when_active"
CHECK ("status" NOT IN ('IN_PROGRESS', 'COMPLETED', 'DISCONTINUED') OR "startedAt" IS NOT NULL);
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_issued_at_required"
CHECK ("status" NOT IN ('ISSUED', 'EXPIRED') OR "issuedAt" IS NOT NULL);
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_expiry_after_issue"
CHECK ("expiresAt" IS NULL OR "issuedAt" IS NULL OR "expiresAt" > "issuedAt");
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "PrescriptionAccess" ADD CONSTRAINT "PrescriptionAccess_expiry_after_creation" CHECK ("expiresAt" > "createdAt");
ALTER TABLE "Dispense" ADD CONSTRAINT "Dispense_reversal_consistent"
CHECK (("status" = 'COMPLETED' AND "reversedAt" IS NULL) OR ("status" = 'REVERSED' AND "reversedAt" IS NOT NULL AND "reversedAt" >= "dispensedAt"));
ALTER TABLE "DispenseItem" ADD CONSTRAINT "DispenseItem_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "DispenseItem" ADD CONSTRAINT "DispenseItem_price_nonnegative" CHECK ("unitPrice" >= 0);
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_delta_nonzero" CHECK ("quantityDelta" <> 0);
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_dispense_direction" CHECK (
  ("reason" = 'DISPENSE' AND "quantityDelta" < 0 AND "dispenseItemId" IS NOT NULL)
  OR ("reason" = 'DISPENSE_REVERSAL' AND "quantityDelta" > 0 AND "dispenseItemId" IS NOT NULL)
  OR ("reason" IN ('OPENING_BALANCE', 'RECEIPT', 'ADJUSTMENT') AND "dispenseItemId" IS NULL)
);

-- Anchor the ledger to current stock without changing pharmacy quantities.
INSERT INTO "StockMovement" ("id", "pharmacyId", "medicineId", "quantityDelta", "reason", "createdAt")
SELECT gen_random_uuid(), "pharmacyId", "medicineId", "quantity", 'OPENING_BALANCE', CURRENT_TIMESTAMP
FROM "PharmacyStock" WHERE "quantity" > 0;
