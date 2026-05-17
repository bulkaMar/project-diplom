-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BASIC', 'STANDARD', 'ADVANCED');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'BASIC';
