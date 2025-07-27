-- CreateEnum
CREATE TYPE "ExpressBookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('MORNING_8_12', 'AFTERNOON_14_18', 'EVENING_18_20', 'ALL_DAY');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "estimatedDuration" INTEGER,
ADD COLUMN     "expressDescription" TEXT,
ADD COLUMN     "expressPrice" DOUBLE PRECISION,
ADD COLUMN     "isExpressAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ExpressBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "floor" INTEGER,
    "hasElevator" BOOLEAN,
    "notes" TEXT,
    "specialRequirements" TEXT,
    "status" "ExpressBookingStatus" NOT NULL DEFAULT 'PENDING',
    "assignedArtisanId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExpressBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpressBooking_bookingDate_idx" ON "ExpressBooking"("bookingDate");

-- CreateIndex
CREATE INDEX "ExpressBooking_status_idx" ON "ExpressBooking"("status");

-- CreateIndex
CREATE INDEX "ExpressBooking_assignedArtisanId_idx" ON "ExpressBooking"("assignedArtisanId");

-- AddForeignKey
ALTER TABLE "ExpressBooking" ADD CONSTRAINT "ExpressBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpressBooking" ADD CONSTRAINT "ExpressBooking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpressBooking" ADD CONSTRAINT "ExpressBooking_assignedArtisanId_fkey" FOREIGN KEY ("assignedArtisanId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
