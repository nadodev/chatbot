-- AlterTable
ALTER TABLE `chat` ADD COLUMN `appearance` JSON NULL,
    ADD COLUMN `behavior` JSON NULL,
    MODIFY `avatar` VARCHAR(191) NOT NULL DEFAULT '🤖';

-- AddForeignKey
ALTER TABLE `ChatSource` ADD CONSTRAINT `ChatSource_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
