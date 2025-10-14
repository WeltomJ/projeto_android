-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `senha` TEXT NULL,
    `telefone` VARCHAR(191) NULL,
    `foto` TEXT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `senha` TEXT NULL,
    `telefone` VARCHAR(191) NULL,
    `foto` TEXT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `locador_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `local` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dono_id` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `endereco_logradouro` VARCHAR(191) NOT NULL,
    `endereco_numero` VARCHAR(191) NULL,
    `endereco_complemento` VARCHAR(191) NULL,
    `endereco_bairro` VARCHAR(191) NULL,
    `endereco_cidade` VARCHAR(191) NOT NULL,
    `endereco_estado` VARCHAR(191) NOT NULL,
    `endereco_cep` VARCHAR(191) NULL,
    `endereco_pais` VARCHAR(191) NOT NULL DEFAULT 'BR',
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `telefone_contato` VARCHAR(191) NULL,
    `email_contato` VARCHAR(191) NULL,
    `site` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `local_latitude_longitude_idx`(`latitude`, `longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `local_id` INTEGER NOT NULL,
    `url` TEXT NOT NULL,
    `tipo` ENUM('IMG', 'VID') NOT NULL DEFAULT 'IMG',
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `local_id` INTEGER NOT NULL,
    `nota` INTEGER NOT NULL,
    `comentario` TEXT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `avaliacao_local_id_idx`(`local_id`),
    INDEX `avaliacao_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lembrete` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `local_id` INTEGER NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `lembrar_em` DATETIME(3) NOT NULL,
    `concluido` BOOLEAN NOT NULL DEFAULT false,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lembrete_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `local_id` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `favorito_usuario_id_local_id_key`(`usuario_id`, `local_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `amenidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `amenidade_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `local_amenidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `local_id` INTEGER NOT NULL,
    `amenidade_id` INTEGER NOT NULL,

    UNIQUE INDEX `local_amenidade_local_id_amenidade_id_key`(`local_id`, `amenidade_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `horario_abertura` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `local_id` INTEGER NOT NULL,
    `dia` INTEGER NOT NULL,
    `hora_abertura` VARCHAR(191) NOT NULL,
    `hora_fechamento` VARCHAR(191) NOT NULL,
    `fechado` BOOLEAN NOT NULL DEFAULT false,

    INDEX `horario_abertura_local_id_idx`(`local_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `redes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `local_id` INTEGER NOT NULL,
    `instagram` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,

    INDEX `redes_local_id_idx`(`local_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `local` ADD CONSTRAINT `local_dono_id_fkey` FOREIGN KEY (`dono_id`) REFERENCES `locador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_local_id_fkey` FOREIGN KEY (`local_id`) REFERENCES `local`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacao` ADD CONSTRAINT `avaliacao_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacao` ADD CONSTRAINT `avaliacao_local_id_fkey` FOREIGN KEY (`local_id`) REFERENCES `local`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lembrete` ADD CONSTRAINT `lembrete_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lembrete` ADD CONSTRAINT `lembrete_local_id_fkey` FOREIGN KEY (`local_id`) REFERENCES `local`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorito` ADD CONSTRAINT `favorito_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorito` ADD CONSTRAINT `favorito_local_id_fkey` FOREIGN KEY (`local_id`) REFERENCES `local`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `local_amenidade` ADD CONSTRAINT `local_amenidade_local_id_fkey` FOREIGN KEY (`local_id`) REFERENCES `local`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `local_amenidade` ADD CONSTRAINT `local_amenidade_amenidade_id_fkey` FOREIGN KEY (`amenidade_id`) REFERENCES `amenidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horario_abertura` ADD CONSTRAINT `horario_abertura_local_id_fkey` FOREIGN KEY (`local_id`) REFERENCES `local`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `redes` ADD CONSTRAINT `redes_local_id_fkey` FOREIGN KEY (`local_id`) REFERENCES `local`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
