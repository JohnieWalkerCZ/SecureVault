/*
  Warnings:

  - You are about to drop the column `iv` on the `Vault` table. All the data in the column will be lost.
  - Added the required column `contentIv` to the `Vault` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleIv` to the `Vault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Vault` DROP COLUMN `iv`,
    ADD COLUMN `contentIv` VARCHAR(191) NOT NULL,
    ADD COLUMN `titleIv` VARCHAR(191) NOT NULL,
    MODIFY `content` VARCHAR(191) NOT NULL;
