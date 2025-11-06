/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `locador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[google_id]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `locador` ADD COLUMN `google_id` VARCHAR(191) NULL,
    ADD COLUMN `provider` VARCHAR(191) NULL DEFAULT 'local';

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `google_id` VARCHAR(191) NULL,
    ADD COLUMN `provider` VARCHAR(191) NULL DEFAULT 'local';

-- CreateIndex
CREATE UNIQUE INDEX `locador_google_id_key` ON `locador`(`google_id`);

-- CreateIndex
CREATE UNIQUE INDEX `usuario_google_id_key` ON `usuario`(`google_id`);
