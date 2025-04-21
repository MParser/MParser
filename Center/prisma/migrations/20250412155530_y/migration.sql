/*
  Warnings:

  - You are about to alter the column `start_time` on the `enb_task_list` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `end_time` on the `enb_task_list` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `file_time` on the `nds_file_list` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- DropIndex
DROP INDEX `nds_file_list_file_path_idx` ON `nds_file_list`;

-- AlterTable
ALTER TABLE `enb_task_list` MODIFY `start_time` DATETIME NOT NULL,
    MODIFY `end_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `nds_file_list` MODIFY `file_time` DATETIME NOT NULL;
