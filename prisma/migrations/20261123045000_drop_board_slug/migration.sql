-- DropIndex
DROP INDEX IF EXISTS "Board_userId_slug_key";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN IF EXISTS "slug";
