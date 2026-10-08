-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Reset legacy users timestamps to NULL
UPDATE "User"
SET "createdAt" = NULL, "updatedAt" = NULL
WHERE "createdAt" <= '2026-10-08 06:07:13';
