/*
  Warnings:

  - You are about to drop the column `userId` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `chat` DROP FOREIGN KEY `Chat_userId_fkey`;

-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_userId_fkey`;

-- AlterTable
ALTER TABLE `chat` DROP COLUMN `userId`,
    ADD COLUMN `dbConfig` JSON NULL,
    MODIFY `avatar` VARCHAR(191) NOT NULL DEFAULT '🤖';

-- DropTable
DROP TABLE `subscription`;

-- DropTable
DROP TABLE `user`;
