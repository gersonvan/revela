-- CreateEnum
CREATE TYPE "EventModerationMode" AS ENUM ('WITH_MODERATION', 'WITHOUT_MODERATION');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "moderationMode" "EventModerationMode" NOT NULL DEFAULT 'WITH_MODERATION';
