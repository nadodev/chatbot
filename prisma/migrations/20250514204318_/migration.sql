/*
  Warnings:

  - You are about to drop the column `appearance` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `behavior` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `sources` on the `chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `chat` DROP COLUMN `appearance`,
    DROP COLUMN `behavior`,
    DROP COLUMN `sources`,
    MODIFY `avatar` VARCHAR(191) NOT NULL DEFAULT '🤖',
    ALTER COLUMN `updatedAt` DROP DEFAULT;
