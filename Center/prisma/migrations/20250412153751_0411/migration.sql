-- CreateTable
CREATE TABLE `gateway_list` (
    `id` VARCHAR(128) NOT NULL,
    `name` VARCHAR(255) NULL,
    `host` VARCHAR(255) NOT NULL,
    `port` INTEGER NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `switch` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nds_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(150) NOT NULL,
    `Address` VARCHAR(100) NOT NULL,
    `Port` INTEGER NOT NULL DEFAULT 2121,
    `Protocol` VARCHAR(20) NOT NULL DEFAULT 'SFTP',
    `Account` VARCHAR(100) NOT NULL,
    `Password` VARCHAR(100) NOT NULL,
    `PoolSize` INTEGER NOT NULL DEFAULT 5,
    `MRO_Path` VARCHAR(250) NOT NULL DEFAULT '/MR/MRO/',
    `MRO_Filter` VARCHAR(250) NOT NULL DEFAULT '^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$',
    `MDT_Path` VARCHAR(250) NOT NULL DEFAULT '/MDT/',
    `MDT_Filter` VARCHAR(250) NOT NULL DEFAULT '^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$',
    `Switch` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gateway_nds_link` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gatewayId` VARCHAR(128) NOT NULL,
    `ndsId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `gateway_nds_link_gatewayId_ndsId_key`(`gatewayId`, `ndsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scanner_list` (
    `id` VARCHAR(128) NOT NULL,
    `gatewayId` VARCHAR(128) NULL,
    `name` VARCHAR(255) NULL,
    `host` VARCHAR(255) NOT NULL,
    `port` INTEGER NOT NULL DEFAULT 10002,
    `status` INTEGER NOT NULL DEFAULT 0,
    `switch` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scanner_nds_link` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scannerId` VARCHAR(128) NOT NULL,
    `ndsId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `scanner_nds_link_scannerId_ndsId_key`(`scannerId`, `ndsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parser_list` (
    `id` VARCHAR(128) NOT NULL,
    `gatewayId` VARCHAR(128) NULL,
    `name` VARCHAR(255) NULL,
    `host` VARCHAR(255) NOT NULL,
    `port` INTEGER NOT NULL DEFAULT 10002,
    `status` INTEGER NOT NULL DEFAULT 0,
    `switch` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nds_file_list` (
    `file_hash` VARCHAR(128) NOT NULL,
    `ndsId` INTEGER NOT NULL,
    `file_path` VARCHAR(250) NOT NULL,
    `file_time` DATETIME NOT NULL,
    `data_type` VARCHAR(64) NOT NULL,
    `sub_file_name` VARCHAR(255) NOT NULL,
    `header_offset` INTEGER NOT NULL DEFAULT 0,
    `compress_size` INTEGER NOT NULL DEFAULT 0,
    `file_size` INTEGER NOT NULL DEFAULT 0,
    `flag_bits` INTEGER NOT NULL DEFAULT 0,
    `enodebid` VARCHAR(16) NOT NULL,
    `parsed` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `nds_file_list_file_path_idx`(`file_path`),
    INDEX `nds_file_list_data_type_idx`(`data_type`),
    INDEX `nds_file_list_enodebid_idx`(`enodebid`),
    INDEX `nds_file_list_parsed_idx`(`parsed`),
    INDEX `nds_file_list_file_time_idx`(`file_time`),
    INDEX `idx_nds_file_composite`(`ndsId`, `data_type`, `file_time`, `enodebid`, `parsed`),
    UNIQUE INDEX `nds_file_list_file_hash_key`(`file_hash`),
    PRIMARY KEY (`file_hash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `data_type` VARCHAR(20) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `remark` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `task_list_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enb_task_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskId` INTEGER NOT NULL,
    `enodebid` VARCHAR(16) NOT NULL,
    `data_type` VARCHAR(64) NOT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `parsed` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 0,
    `trigger_check` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `enb_task_list_taskId_idx`(`taskId`),
    INDEX `enb_task_list_enodebid_idx`(`enodebid`),
    INDEX `enb_task_list_parsed_idx`(`parsed`),
    INDEX `enb_task_list_status_idx`(`status`),
    INDEX `enb_task_list_trigger_check_idx`(`trigger_check`),
    INDEX `idx_enb_task_composite`(`enodebid`, `data_type`, `parsed`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cell_data` (
    `CGI` VARCHAR(64) NOT NULL,
    `eNodeBID` INTEGER NOT NULL,
    `PCI` INTEGER NOT NULL,
    `Azimuth` INTEGER NULL,
    `Earfcn` INTEGER NOT NULL,
    `Freq` DOUBLE NOT NULL,
    `eNBName` VARCHAR(200) NULL,
    `userLabel` VARCHAR(200) NULL,
    `Longitude` DOUBLE NOT NULL,
    `Latitude` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cell_data_CGI_idx`(`CGI`),
    INDEX `cell_data_eNodeBID_idx`(`eNodeBID`),
    PRIMARY KEY (`CGI`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gateway_nds_link` ADD CONSTRAINT `gateway_nds_link_gatewayId_fkey` FOREIGN KEY (`gatewayId`) REFERENCES `gateway_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gateway_nds_link` ADD CONSTRAINT `gateway_nds_link_ndsId_fkey` FOREIGN KEY (`ndsId`) REFERENCES `nds_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scanner_list` ADD CONSTRAINT `scanner_list_gatewayId_fkey` FOREIGN KEY (`gatewayId`) REFERENCES `gateway_list`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scanner_nds_link` ADD CONSTRAINT `scanner_nds_link_scannerId_fkey` FOREIGN KEY (`scannerId`) REFERENCES `scanner_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scanner_nds_link` ADD CONSTRAINT `scanner_nds_link_ndsId_fkey` FOREIGN KEY (`ndsId`) REFERENCES `nds_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parser_list` ADD CONSTRAINT `parser_list_gatewayId_fkey` FOREIGN KEY (`gatewayId`) REFERENCES `gateway_list`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
