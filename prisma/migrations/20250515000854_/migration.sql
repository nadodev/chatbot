-- AlterTable
ALTER TABLE `chat` MODIFY `avatar` VARCHAR(191) NOT NULL DEFAULT '🤖';

-- CreateTable
CREATE TABLE `ChatConfig` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `aiProvider` VARCHAR(191) NOT NULL DEFAULT 'google',
    `model` VARCHAR(191) NOT NULL DEFAULT 'gemini-2.0-flash',
    `temperature` DOUBLE NOT NULL DEFAULT 0.7,
    `maxTokens` INTEGER NOT NULL DEFAULT 150,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ChatConfig_chatId_key`(`chatId`),
    INDEX `ChatConfig_chatId_idx`(`chatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatConfig` ADD CONSTRAINT `ChatConfig_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
