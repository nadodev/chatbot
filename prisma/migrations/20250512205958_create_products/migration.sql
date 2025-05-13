/*
  Warnings:

  - You are about to drop the column `inStock` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `inStock`,
    ADD COLUMN `in_stock` BOOLEAN NOT NULL DEFAULT true;
