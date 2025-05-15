-- AlterTable
ALTER TABLE `chat` ADD COLUMN `dataSource` VARCHAR(191) NULL DEFAULT 'database',
    ADD COLUMN `theme` JSON NULL,
    MODIFY `avatar` VARCHAR(191) NOT NULL DEFAULT '🤖';

-- CreateTable
CREATE TABLE `Settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `aiProvider` VARCHAR(191) NOT NULL DEFAULT 'google',
    `googleApiKey` VARCHAR(191) NULL,
    `openaiApiKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
