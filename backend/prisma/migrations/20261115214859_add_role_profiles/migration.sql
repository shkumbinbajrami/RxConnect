-- CreateTable
CREATE TABLE "DoctorProfile" (
    "userId" UUID NOT NULL,
    "fullName" TEXT,
    "specialty" TEXT,
    "licenseNumber" TEXT,
    "workplace" TEXT,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "FarmacyProfile" (
    "userId" UUID NOT NULL,
    "pharmacyName" TEXT,
    "licenseNumber" TEXT,
    "address" TEXT,
    "phone" TEXT,

    CONSTRAINT "FarmacyProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PatientProfile" (
    "userId" UUID NOT NULL,
    "fullName" TEXT,
    "dateOfBirth" DATE,
    "phone" TEXT,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_licenseNumber_key" ON "DoctorProfile"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FarmacyProfile_licenseNumber_key" ON "FarmacyProfile"("licenseNumber");

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmacyProfile" ADD CONSTRAINT "FarmacyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
