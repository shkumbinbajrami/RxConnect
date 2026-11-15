-- Rename in place so existing users, profile rows, and stock relations are preserved.
ALTER TYPE "Role" RENAME VALUE 'FARMACY' TO 'PHARMACY';
ALTER TABLE "FarmacyProfile" RENAME TO "PharmacyProfile";
ALTER TABLE "PharmacyProfile" RENAME CONSTRAINT "FarmacyProfile_pkey" TO "PharmacyProfile_pkey";
ALTER INDEX "FarmacyProfile_licenseNumber_key" RENAME TO "PharmacyProfile_licenseNumber_key";
ALTER TABLE "PharmacyProfile" RENAME CONSTRAINT "FarmacyProfile_userId_fkey" TO "PharmacyProfile_userId_fkey";
