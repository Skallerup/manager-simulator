-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "budget" SET DEFAULT 10000000000,
ALTER COLUMN "budget" SET DATA TYPE BIGINT;

-- CreateTable
CREATE TABLE "TrainingMatch" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "userTeamId" TEXT NOT NULL,
    "opponentTeamId" TEXT NOT NULL,
    "userScore" INTEGER DEFAULT 0,
    "opponentScore" INTEGER DEFAULT 0,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "events" TEXT,
    "highlights" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingMatch_pkey" PRIMARY KEY ("id")
);

-- RenameForeignKey
ALTER TABLE "MatchHighlight" RENAME CONSTRAINT "MatchHighlight_matchId_fkey" TO "BotMatchHighlights_matchId_fkey";

-- AddForeignKey
ALTER TABLE "TrainingMatch" ADD CONSTRAINT "TrainingMatch_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingMatch" ADD CONSTRAINT "TrainingMatch_userTeamId_fkey" FOREIGN KEY ("userTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingMatch" ADD CONSTRAINT "TrainingMatch_opponentTeamId_fkey" FOREIGN KEY ("opponentTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchHighlight" ADD CONSTRAINT "TrainingMatchHighlights_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "TrainingMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
