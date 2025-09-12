-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('SEATING', 'LED_SCREENS', 'SOUND_SYSTEM', 'LIGHTING', 'PARKING', 'TRANSPORT', 'FAN_ZONE', 'MERCHANDISE', 'FOOD_BEVERAGE', 'VIP_LOUNGE', 'WIFI', 'ACCESSIBILITY', 'SECURITY', 'MEDIA', 'SPONSOR');

-- CreateEnum
CREATE TYPE "UpgradeType" AS ENUM ('CAPACITY_EXPANSION', 'FACILITY_UPGRADE', 'NEW_FACILITY', 'RENOVATION', 'TECHNOLOGY', 'SUSTAINABILITY');

-- CreateEnum
CREATE TYPE "UpgradeStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Stadium" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 20000,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "atmosphere" INTEGER NOT NULL DEFAULT 50,
    "maintenanceCost" INTEGER NOT NULL DEFAULT 100000,
    "monthlyRevenue" INTEGER NOT NULL DEFAULT 500000,
    "homeAdvantage" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "prestige" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "Stadium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StadiumFacility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FacilityType" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "capacity" INTEGER,
    "revenue" INTEGER NOT NULL DEFAULT 0,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "effect" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stadiumId" TEXT NOT NULL,

    CONSTRAINT "StadiumFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StadiumUpgrade" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UpgradeType" NOT NULL,
    "cost" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" "UpgradeStatus" NOT NULL DEFAULT 'PLANNED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stadiumId" TEXT NOT NULL,

    CONSTRAINT "StadiumUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stadium_teamId_key" ON "Stadium"("teamId");

-- AddForeignKey
ALTER TABLE "Stadium" ADD CONSTRAINT "Stadium_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StadiumFacility" ADD CONSTRAINT "StadiumFacility_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StadiumUpgrade" ADD CONSTRAINT "StadiumUpgrade_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
