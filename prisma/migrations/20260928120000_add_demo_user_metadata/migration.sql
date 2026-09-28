ALTER TABLE "User" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "demoTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "demoExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX "User_demoTokenHash_key" ON "User"("demoTokenHash");
CREATE INDEX "User_isDemo_demoExpiresAt_idx" ON "User"("isDemo", "demoExpiresAt");
