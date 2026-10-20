-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
