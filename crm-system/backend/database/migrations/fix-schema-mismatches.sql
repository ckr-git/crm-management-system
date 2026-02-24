-- =============================================
-- 数据库架构修复脚本
-- 修复 Sequelize 模型和 DDL 之间的不匹配
-- 执行时间: 2025-10-17
-- =============================================

USE `crm_system`;

-- =============================================
-- 问题1: permissions 表缺少 updated_at 和 deleted_at
-- =============================================
-- Permission 模型启用了 paranoid: true（默认），但表中缺少 deleted_at
-- 同时缺少 updated_at，但 Sequelize timestamps 默认需要
ALTER TABLE `permissions` 
ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `created_at`,
ADD COLUMN `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间' AFTER `updated_at`;

-- =============================================
-- 问题2: operation_logs 表缺少 updated_at 和 deleted_at
-- =============================================
-- OperationLog 模型启用了 paranoid: true（默认），但表中缺少 deleted_at
-- 注意：操作日志通常不需要软删除，但为了保持一致性先添加列
ALTER TABLE `operation_logs` 
ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `created_at`,
ADD COLUMN `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间' AFTER `updated_at`;

-- =============================================
-- 问题3: notifications 表缺少 updated_at
-- =============================================
-- Notification 模型期望 updated_at，但 DDL 只创建了 created_at
ALTER TABLE `notifications` 
ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `created_at`;

-- =============================================
-- 额外修复: notifications 表缺少 sender_id 和 extra_data
-- =============================================
-- notificationController.js 中使用了 sender_id 和 extra_data 字段
-- 但原始 DDL 中未定义
ALTER TABLE `notifications` 
ADD COLUMN `sender_id` INT UNSIGNED DEFAULT NULL COMMENT '发送人ID' AFTER `user_id`,
ADD COLUMN `extra_data` JSON DEFAULT NULL COMMENT '额外数据' AFTER `link`,
ADD INDEX `idx_sender_id` (`sender_id`);

-- =============================================
-- 验证修复结果
-- =============================================
-- 查看 permissions 表结构
DESCRIBE `permissions`;

-- 查看 operation_logs 表结构
DESCRIBE `operation_logs`;

-- 查看 notifications 表结构
DESCRIBE `notifications`;

-- =============================================
-- 完成提示
-- =============================================
SELECT '✅ 数据库架构修复完成' AS message;
SELECT '已添加缺失的 updated_at 和 deleted_at 列' AS details;
SELECT '所有表现在与 Sequelize 模型定义一致' AS status;
