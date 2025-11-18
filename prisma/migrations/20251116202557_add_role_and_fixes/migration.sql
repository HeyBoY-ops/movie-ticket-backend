/*
  Warnings:

  - You are about to alter the column `genre` on the `Movie` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `cast` on the `Movie` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `Movie` MODIFY `genre` JSON NULL,
    MODIFY `cast` JSON NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'user';
