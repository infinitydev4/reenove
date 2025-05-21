-- CreateEnum
CREATE TYPE "PropertyCondition" AS ENUM ('NEW', 'GOOD', 'OLD', 'DEMOLISH');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "condition" "PropertyCondition",
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "hasElevator" BOOLEAN,
ADD COLUMN     "surface" DOUBLE PRECISION;
