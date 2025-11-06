-- AlterTable
ALTER TABLE `lembrete` ADD COLUMN `notificado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `expo_push_token` TEXT NULL;

-- CreateIndex
CREATE INDEX `lembrete_lembrar_em_idx` ON `lembrete`(`lembrar_em`);
