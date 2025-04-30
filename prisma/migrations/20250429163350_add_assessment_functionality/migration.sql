-- CreateEnum
CREATE TYPE "ArtisanLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'CONFIRMED', 'EXPERT');

-- CreateEnum
CREATE TYPE "ArtisanVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "ArtisanProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "siret" TEXT,
    "yearsOfExperience" INTEGER,
    "projectsCompleted" INTEGER NOT NULL DEFAULT 0,
    "preferredRadius" INTEGER DEFAULT 50,
    "level" "ArtisanLevel",
    "averageRating" DOUBLE PRECISION,
    "verificationStatus" "ArtisanVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "availableForWork" BOOLEAN NOT NULL DEFAULT true,
    "assessmentCompleted" BOOLEAN NOT NULL DEFAULT false,
    "assessmentScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtisanProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtisanSpecialty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtisanSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtisanDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtisanDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtisanSkill" (
    "id" TEXT NOT NULL,
    "artisanProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "selfRating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtisanSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtisanProfile_userId_key" ON "ArtisanProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtisanSpecialty_userId_serviceId_key" ON "ArtisanSpecialty"("userId", "serviceId");

-- AddForeignKey
ALTER TABLE "ArtisanProfile" ADD CONSTRAINT "ArtisanProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanSpecialty" ADD CONSTRAINT "ArtisanSpecialty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanSpecialty" ADD CONSTRAINT "ArtisanSpecialty_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanDocument" ADD CONSTRAINT "ArtisanDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanSkill" ADD CONSTRAINT "ArtisanSkill_artisanProfileId_fkey" FOREIGN KEY ("artisanProfileId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
