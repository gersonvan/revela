-- CreateTable
CREATE TABLE "ModeratorSession" (
    "id" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "platform" TEXT,
    "appVersion" TEXT,
    "deviceName" TEXT,
    "pushToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ModeratorSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModeratorSession_tokenHash_key" ON "ModeratorSession"("tokenHash");

-- CreateIndex
CREATE INDEX "ModeratorSession_moderatorId_idx" ON "ModeratorSession"("moderatorId");

-- CreateIndex
CREATE INDEX "ModeratorSession_revokedAt_idx" ON "ModeratorSession"("revokedAt");

-- CreateIndex
CREATE INDEX "ModeratorSession_expiresAt_idx" ON "ModeratorSession"("expiresAt");

-- AddForeignKey
ALTER TABLE "ModeratorSession" ADD CONSTRAINT "ModeratorSession_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
