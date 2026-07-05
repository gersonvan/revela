-- AlterEnum
ALTER TYPE "ModerationAction" ADD VALUE 'AUTO_APPROVED';

-- DropForeignKey
ALTER TABLE "ModerationDecision" DROP CONSTRAINT "ModerationDecision_moderatorId_fkey";

-- AlterTable
ALTER TABLE "ModerationDecision" ALTER COLUMN "moderatorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ModerationDecision" ADD CONSTRAINT "ModerationDecision_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
