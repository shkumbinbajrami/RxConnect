-- CreateTable
CREATE TABLE "Medicine" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "strength" TEXT,
    "form" TEXT,
    "unit" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyStock" (
    "pharmacyId" UUID NOT NULL,
    "medicineId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyStock_pkey" PRIMARY KEY ("pharmacyId","medicineId")
);

-- Ensure pharmacies registered before profile creation also have a profile row.
INSERT INTO "FarmacyProfile" ("userId")
SELECT "id" FROM "User" WHERE "role" = 'FARMACY'
ON CONFLICT ("userId") DO NOTHING;

-- Stock and shared prices cannot be negative.
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_price_nonnegative" CHECK ("price" >= 0);
ALTER TABLE "PharmacyStock" ADD CONSTRAINT "PharmacyStock_quantity_nonnegative" CHECK ("quantity" >= 0);

-- CreateIndex
CREATE INDEX "PharmacyStock_medicineId_idx" ON "PharmacyStock"("medicineId");

-- AddForeignKey
ALTER TABLE "PharmacyStock" ADD CONSTRAINT "PharmacyStock_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "FarmacyProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyStock" ADD CONSTRAINT "PharmacyStock_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
