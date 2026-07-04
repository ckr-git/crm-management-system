-- =============================================
-- CRM客户关系管理系统 - 数据库初始化脚本
-- 版本：v1.0
-- 创建日期：2025-01-17
-- 数据库：MySQL 8.0
-- 字符集：utf8mb4
-- =============================================

-- 确保连接使用 utf8mb4 字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `crm_system`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `crm_system`;

-- =============================================
-- 1. 用户权限模块
-- =============================================

-- 1.1 部门表
CREATE TABLE `departments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '部门ID',
  `name` VARCHAR(50) NOT NULL COMMENT '部门名称',
  `parent_id` INT UNSIGNED DEFAULT NULL COMMENT '父部门ID',
  `manager_id` INT UNSIGNED DEFAULT NULL COMMENT '部门经理ID',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '部门描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- 1.2 角色表
CREATE TABLE `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色代码',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '角色描述',
  `is_system` TINYINT NOT NULL DEFAULT 0 COMMENT '是否系统角色：1是 0否',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_code` (`code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 1.3 权限表
CREATE TABLE `permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '权限ID',
  `name` VARCHAR(100) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限代码',
  `parent_id` INT UNSIGNED DEFAULT NULL COMMENT '父权限ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `type` VARCHAR(20) DEFAULT 'action' COMMENT '权限类型: menu菜单 action操作',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  
  INDEX `idx_code` (`code`),
  INDEX `idx_type` (`type`),
  INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 1.4 角色权限关联表
CREATE TABLE `role_permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `role_id` INT UNSIGNED NOT NULL COMMENT '角色ID',
  `permission_id` INT UNSIGNED NOT NULL COMMENT '权限ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 1.5 用户表
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名（手机号）',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（BCrypt加密）',
  `name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `role_id` INT UNSIGNED NOT NULL COMMENT '角色ID',
  `department_id` INT UNSIGNED DEFAULT NULL COMMENT '部门ID',
  `manager_id` INT UNSIGNED DEFAULT NULL COMMENT '直属上级ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
  `login_count` INT UNSIGNED DEFAULT 0 COMMENT '登录次数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  
  INDEX `idx_username` (`username`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_department_id` (`department_id`),
  INDEX `idx_manager_id` (`manager_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 2. 客户管理模块
-- =============================================

-- 2.1 客户表
CREATE TABLE `customers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '客户ID',
  `code` VARCHAR(20) NOT NULL COMMENT '客户编号：C+YYYYMMDD+4位流水号',
  `name` VARCHAR(100) NOT NULL COMMENT '公司名称',
  `short_name` VARCHAR(50) DEFAULT NULL COMMENT '公司简称',
  `credit_code` VARCHAR(50) DEFAULT NULL COMMENT '统一社会信用代码',
  `contact` VARCHAR(50) NOT NULL COMMENT '联系人',
  `position` VARCHAR(50) DEFAULT NULL COMMENT '联系人职位',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `mobile` VARCHAR(20) DEFAULT NULL COMMENT '手机号码',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `wechat` VARCHAR(50) DEFAULT NULL COMMENT '微信号',
  `qq` VARCHAR(20) DEFAULT NULL COMMENT 'QQ号',
  `address` VARCHAR(200) DEFAULT NULL COMMENT '公司地址',
  `website` VARCHAR(200) DEFAULT NULL COMMENT '公司网站',
  `industry` VARCHAR(50) DEFAULT NULL COMMENT '所属行业',
  `company_size` VARCHAR(20) DEFAULT NULL COMMENT '公司规模',
  `source` VARCHAR(50) NOT NULL COMMENT '客户来源',
  `level` VARCHAR(20) DEFAULT 'normal' COMMENT '客户等级',
  `stage` VARCHAR(50) NOT NULL DEFAULT 'potential' COMMENT '客户阶段',
  `tags` JSON DEFAULT NULL COMMENT '客户标签',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  `owner_id` INT UNSIGNED NULL COMMENT '负责人ID（公海客户为NULL）',
  `last_followup_at` DATETIME DEFAULT NULL COMMENT '最后跟进time',
  `next_followup_at` DATETIME DEFAULT NULL COMMENT '下次跟进时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  
  INDEX `idx_name` (`name`),
  UNIQUE KEY `uk_code` (`code`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_source` (`source`),
  INDEX `idx_stage` (`stage`),
  INDEX `idx_level` (`level`),
  INDEX `idx_last_followup_at` (`last_followup_at`),
  INDEX `idx_created_at` (`created_at`),
  FULLTEXT KEY `ft_name_contact` (`name`, `contact`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

-- 2.2 客户联系人表
CREATE TABLE `contacts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '联系人ID',
  `customer_id` INT UNSIGNED NOT NULL COMMENT '客户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `position` VARCHAR(50) DEFAULT NULL COMMENT '职位',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '电话',
  `mobile` VARCHAR(20) DEFAULT NULL COMMENT '手机',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `wechat` VARCHAR(50) DEFAULT NULL COMMENT '微信',
  `qq` VARCHAR(20) DEFAULT NULL COMMENT 'QQ',
  `is_main` TINYINT DEFAULT 0 COMMENT '是否主联系人：1是 0否',
  `birthday` DATE DEFAULT NULL COMMENT '生日',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户联系人表';

-- 2.3 跟进记录表
CREATE TABLE `followups` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '跟进记录ID',
  `customer_id` INT UNSIGNED NOT NULL COMMENT '客户ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '跟进人ID',
  `type` VARCHAR(20) NOT NULL COMMENT '跟进方式：phone电话 visit拜访 email邮件 wechat微信',
  `content` TEXT NOT NULL COMMENT '跟进内容',
  `result` VARCHAR(50) DEFAULT NULL COMMENT '跟进结果',
  `next_plan` TEXT DEFAULT NULL COMMENT '下次计划',
  `next_followup_at` DATETIME DEFAULT NULL COMMENT '下次跟进时间',
  `attachments` JSON DEFAULT NULL COMMENT '附件',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跟进记录表';

-- 2.4 客户公海池表
CREATE TABLE `customer_pool` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `customer_id` INT UNSIGNED NOT NULL COMMENT '客户ID',
  `previous_owner_id` INT UNSIGNED NOT NULL COMMENT '原负责人ID',
  `reason` VARCHAR(100) NOT NULL COMMENT '进入公海原因',
  `enter_at` DATETIME NOT NULL COMMENT '进入时间',
  `claimed_by` INT UNSIGNED DEFAULT NULL COMMENT '领取人ID',
  `claimed_at` DATETIME DEFAULT NULL COMMENT '领取时间',
  `status` VARCHAR(20) NOT NULL DEFAULT 'available' COMMENT '状态：available可领取 claimed已领取',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_enter_at` (`enter_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户公海池表';

-- 2.5 客户转移记录表
CREATE TABLE `customer_transfers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '转移记录ID',
  `customer_id` INT UNSIGNED NOT NULL COMMENT '客户ID',
  `from_user_id` INT UNSIGNED NOT NULL COMMENT '原负责人ID',
  `to_user_id` INT UNSIGNED NOT NULL COMMENT '新负责人ID',
  `transfer_by` INT UNSIGNED NOT NULL COMMENT '操作人BID',
  `reason` VARCHAR(200) DEFAULT NULL COMMENT '转移原因',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '转移时间',
  
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_from_user_id` (`from_user_id`),
  INDEX `idx_to_user_id` (`to_user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户转移记录表';

-- =============================================
-- 3. 销售机会模块
-- =============================================

-- 3.1 销售机会表
CREATE TABLE `opportunities` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '销售机会ID',
  `customer_id` INT UNSIGNED NOT NULL COMMENT '客户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '机会名称',
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '预计金额',
  `stage` VARCHAR(50) NOT NULL DEFAULT 'initial' COMMENT '当前阶段',
  `probability` INT DEFAULT 0 COMMENT '成单概率（%）',
  `expected_close_date` DATE DEFAULT NULL COMMENT '预计成交日期',
  `priority` VARCHAR(20) DEFAULT 'medium' COMMENT '优先级：high高 medium中 low低',
  `product` VARCHAR(100) DEFAULT NULL COMMENT '产品/服务',
  `description` TEXT DEFAULT NULL COMMENT '机会描述',
  `owner_id` INT UNSIGNED NOT NULL COMMENT '负责人ID',
  `status` VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT '状态：open进行中 won赢单 lost输单',
  `win_reason` VARCHAR(200) DEFAULT NULL COMMENT '赢单原因',
  `lose_reason` VARCHAR(200) DEFAULT NULL COMMENT '输单原因',
  `close_date` DATE DEFAULT NULL COMMENT '实际成交日期',
  `actual_amount` DECIMAL(12,2) DEFAULT NULL COMMENT '实际成交金额',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_stage` (`stage`),
  INDEX `idx_status` (`status`),
  INDEX `idx_expected_close_date` (`expected_close_date`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售机会表';

-- 3.2 销售阶段历史表
CREATE TABLE `opportunity_stage_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `opportunity_id` INT UNSIGNED NOT NULL COMMENT '销售机会ID',
  `from_stage` VARCHAR(50) DEFAULT NULL COMMENT '原阶段',
  `to_stage` VARCHAR(50) NOT NULL COMMENT '新阶段',
  `user_id` INT UNSIGNED NOT NULL COMMENT '操作人ID',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
  
  INDEX `idx_opportunity_id` (`opportunity_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售阶段历史表';

-- =============================================
-- 4. 系统配置模块
-- =============================================

-- 4.1 字典表
CREATE TABLE `dictionaries` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '字典ID',
  `type` VARCHAR(50) NOT NULL COMMENT '字典类型',
  `label` VARCHAR(50) NOT NULL COMMENT '标签',
  `value` VARCHAR(50) NOT NULL COMMENT '值',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY `uk_type_value` (`type`, `value`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典表';

-- 4.2 系统配置表
CREATE TABLE `system_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
  `key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `value` TEXT DEFAULT NULL COMMENT '配置值',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '配置说明',
  `type` VARCHAR(20) DEFAULT 'string' COMMENT '值类型：string number boolean json',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 4.3 操作日志表
CREATE TABLE `operation_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '操作人ID',
  `module` VARCHAR(50) NOT NULL COMMENT '模块',
  `action` VARCHAR(50) NOT NULL COMMENT '操作',
  `resource_type` VARCHAR(50) DEFAULT NULL COMMENT '资源类型',
  `resource_id` INT UNSIGNED DEFAULT NULL COMMENT '资源ID',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '操作描述',
  `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
  `request_data` JSON DEFAULT NULL COMMENT '请求数据',
  `response_data` JSON DEFAULT NULL COMMENT '响应数据',
  `status` VARCHAR(20) DEFAULT 'success' COMMENT '状态：success成功 fail失败',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_module_action` (`module`, `action`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 4.4 附件表
CREATE TABLE `attachments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '附件ID',
  `resource_type` VARCHAR(50) NOT NULL COMMENT '资源类型',
  `resource_id` INT UNSIGNED NOT NULL COMMENT '资源ID',
  `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
  `file_size` BIGINT UNSIGNED NOT NULL COMMENT '文件大小（字节）',
  `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
  `mime_type` VARCHAR(100) DEFAULT NULL COMMENT 'MIME类型',
  `uploaded_by` INT UNSIGNED NOT NULL COMMENT '上传人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  
  INDEX `idx_resource` (`resource_type`, `resource_id`),
  INDEX `idx_uploaded_by` (`uploaded_by`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='附件表';

-- 4.5 通知消息表
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '通知ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '接收人BID',
  `sender_id` INT UNSIGNED DEFAULT NULL COMMENT '发送人BID',
  `type` VARCHAR(50) NOT NULL COMMENT '通知类型',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `content` TEXT DEFAULT NULL COMMENT '内容',
  `link` VARCHAR(500) DEFAULT NULL COMMENT '链接',
  `extra_data` JSON DEFAULT NULL COMMENT '额外数据',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：1是 0否',
  `read_at` DATETIME DEFAULT NULL COMMENT '阅读时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_sender_id` (`sender_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知消息表';

-- 4.6 系统配置表 (system_configs)
CREATE TABLE `system_configs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
  `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `config_value` TEXT DEFAULT NULL COMMENT '配置值',
  `config_type` VARCHAR(20) NOT NULL DEFAULT 'string' COMMENT '值类型：string number boolean json',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '配置说明',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- =============================================
-- 5. 工作流模块
-- =============================================

-- 5.1 工作流定义表
CREATE TABLE `workflows` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '工作流ID',
  `name` VARCHAR(100) NOT NULL COMMENT '工作流名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '工作流编码',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '工作流描述',
  `type` VARCHAR(50) NOT NULL COMMENT '流程类型',
  `config` JSON NOT NULL COMMENT '流程配置',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_code` (`code`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流定义表';

-- 5.2 流程实例表
CREATE TABLE `workflow_instances` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '实例ID',
  `workflow_id` INT UNSIGNED NOT NULL COMMENT '工作流ID',
  `title` VARCHAR(200) NOT NULL COMMENT '流程标题',
  `initiator_id` INT UNSIGNED NOT NULL COMMENT '发起人BID',
  `business_type` VARCHAR(50) DEFAULT NULL COMMENT '业务类型',
  `business_id` INT UNSIGNED DEFAULT NULL COMMENT '业务ID',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '流程状态：pending进行中 approved已通过 rejected已拒绝',
  `current_node` VARCHAR(50) DEFAULT NULL COMMENT '当前节点',
  `data` JSON DEFAULT NULL COMMENT '流程数据',
  `finished_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_workflow_id` (`workflow_id`),
  INDEX `idx_initiator_id` (`initiator_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_business` (`business_type`, `business_id`),
  CONSTRAINT `fk_instance_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_instance_initiator` FOREIGN KEY (`initiator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流程实例表';

-- 5.3 工作流任务表
CREATE TABLE `workflow_tasks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `instance_id` INT UNSIGNED NOT NULL COMMENT '流程实例ID',
  `node_id` VARCHAR(50) NOT NULL COMMENT '节点ID',
  `node_name` VARCHAR(100) NOT NULL COMMENT '节点名称',
  `assignee_id` INT UNSIGNED NOT NULL COMMENT '处理人BID',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '任务状态：pending待处理 approved已通过 rejected已拒绝',
  `comment` TEXT DEFAULT NULL COMMENT '审批意见',
  `handled_at` DATETIME DEFAULT NULL COMMENT '处理时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_instance_id` (`instance_id`),
  INDEX `idx_assignee_id` (`assignee_id`),
  INDEX `idx_status` (`status`),
  CONSTRAINT `fk_task_instance` FOREIGN KEY (`instance_id`) REFERENCES `workflow_instances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_assignee` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流任务表';

-- =============================================
-- 6. 初始化数据
-- =============================================

-- 6.1 初始化角色
INSERT INTO `roles` (`name`, `code`, `description`, `is_system`, `status`) VALUES
('系统管理员', 'admin', '系统最高权限', 1, 1),
('销售经理', 'manager', '销售团队管理者', 1, 1),
('销售人员', 'sales', '普通销售人员', 1, 1),
('财务人员', 'finance', '财务部门人员', 1, 1);

-- 6.2 初始化管理员账号（密码：admin123，已BCrypt加密）
INSERT INTO `users` (`username`, `password`, `name`, `email`, `phone`, `role_id`, `status`) VALUES
('admin', '$2b$10$O.Gjn/R0WkP8E4O2fXpCKuka32gSL5arTXvdVY/QNXPfSZhrpxhHS', '系统管理员', 'admin@crm.com', '13800138000', 1, 1);

-- 6.3 初始化字典数据

-- 客户来源
INSERT INTO `dictionaries` (`type`, `label`, `value`, `sort_order`) VALUES
('customer_source', '网站咨询', 'website', 1),
('customer_source', '电话咨询', 'phone', 2),
('customer_source', '展会活动', 'exhibition', 3),
('customer_source', '老客户转介绍', 'referral', 4),
('customer_source', '广告投放', 'advertisement', 5),
('customer_source', '其他', 'other', 99);

-- 客户阶段
INSERT INTO `dictionaries` (`type`, `label`, `value`, `sort_order`) VALUES
('customer_stage', '潜在客户', 'potential', 1),
('customer_stage', '意向客户', 'intention', 2),
('customer_stage', '报价中', 'quotation', 3),
('customer_stage', '谈判中', 'negotiation', 4),
('customer_stage', '成交客户', 'deal', 5);

-- 客户等级
INSERT INTO `dictionaries` (`type`, `label`, `value`, `sort_order`) VALUES
('customer_level', '普通客户', 'normal', 1),
('customer_level', '重要客户', 'important', 2),
('customer_level', 'VIP客户', 'vip', 3);

-- 所属行业
INSERT INTO `dictionaries` (`type`, `label`, `value`, `sort_order`) VALUES
('industry', 'IT互联网', 'it', 1),
('industry', '制造业', 'manufacturing', 2),
('industry', '金融服务', 'finance', 3),
('industry', '教育培训', 'education', 4),
('industry', '医疗健康', 'healthcare', 5),
('industry', '房地产', 'realestate', 6),
('industry', '其他', 'other', 99);

-- 公司规模
INSERT INTO `dictionaries` (`type`, `label`, `value`, `sort_order`) VALUES
('company_size', '20人以下', '1-20', 1),
('company_size', '20-50人', '21-50', 2),
('company_size', '50-100人', '51-100', 3),
('company_size', '100-500人', '101-500', 4),
('company_size', '500人以上', '500+', 5);

-- 销售阶段
INSERT INTO `dictionaries` (`type`, `label`, `value`, `sort_order`) VALUES
('opportunity_stage', '初步接触', 'initial', 1),
('opportunity_stage', '需求确认', 'requirement', 2),
('opportunity_stage', '方案报价', 'proposal', 3),
('opportunity_stage', '商务谈判', 'negotiation', 4),
('opportunity_stage', '合同签订', 'contract', 5);

-- 跟进方式
INSERT INTO `dictionaries` (`type`, `label`, `value`, `sort_order`) VALUES
('followup_type', '电话沟通', 'phone', 1),
('followup_type', '上门拜访', 'visit', 2),
('followup_type', '邮件联系', 'email', 3),
('followup_type', '微信沟通', 'wechat', 4),
('followup_type', '其他', 'other', 99);

-- =============================================
-- 7. 创建视图（可选）
-- =============================================

-- 客户统计视图
CREATE VIEW `v_customer_statistics` AS
SELECT 
  u.id AS user_id,
  u.name AS user_name,
  COUNT(DISTINCT c.id) AS total_customers,
  COUNT(DISTINCT CASE WHEN c.stage = 'deal' THEN c.id END) AS deal_customers,
  COUNT(DISTINCT CASE WHEN c.last_followup_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN c.id END) AS active_customers
FROM users u
LEFT JOIN customers c ON u.id = c.owner_id AND c.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name;

-- =============================================
-- 8. 业务种子数据
-- =============================================

-- 8.1 初始化部门
INSERT INTO `departments` (`id`, `name`, `description`, `sort_order`, `status`) VALUES
(1, '销售一部', '负责华东区域销售', 1, 1),
(2, '销售二部', '负责华南区域销售', 2, 1),
(3, '市场部', '负责市场推广和品牌', 3, 1);

-- 8.2 初始化销售团队用户（密码统一为 123456）
INSERT INTO `users` (`id`, `username`, `password`, `name`, `email`, `phone`, `role_id`, `department_id`, `status`) VALUES
(2, 'manager01', '$2b$10$LfLyY8wO4ot/wb7ytlWiyeDewnN.Xqid6wlh3V88zd3p82nGdRsQy', '张经理', 'zhang@crm.com', '13900139001', 2, 1, 1),
(3, 'sales01', '$2b$10$LfLyY8wO4ot/wb7ytlWiyeDewnN.Xqid6wlh3V88zd3p82nGdRsQy', '李明', 'liming@crm.com', '13900139002', 3, 1, 1),
(4, 'sales02', '$2b$10$LfLyY8wO4ot/wb7ytlWiyeDewnN.Xqid6wlh3V88zd3p82nGdRsQy', '王芳', 'wangfang@crm.com', '13900139003', 3, 1, 1),
(5, 'sales03', '$2b$10$LfLyY8wO4ot/wb7ytlWiyeDewnN.Xqid6wlh3V88zd3p82nGdRsQy', '赵强', 'zhaoqiang@crm.com', '13900139004', 3, 2, 1),
(6, 'sales04', '$2b$10$LfLyY8wO4ot/wb7ytlWiyeDewnN.Xqid6wlh3V88zd3p82nGdRsQy', '陈静', 'chenjing@crm.com', '13900139005', 3, 2, 1);

-- 8.3 初始化客户数据（覆盖多个行业、来源、阶段、等级）
INSERT INTO `customers` (`id`, `code`, `name`, `contact`, `phone`, `email`, `industry`, `company_size`, `source`, `level`, `stage`, `owner_id`, `address`, `last_followup_at`, `created_at`) VALUES
(1, 'C202501010001', '北京云智科技有限公司', '刘总', '010-88881001', 'liu@yunzhi.com', 'it', '101-500', 'website', 'vip', 'deal', 3, '北京市海淀区中关村大街1号', '2025-01-10 10:00:00', '2024-10-01 09:00:00'),
(2, 'C202501020002', '上海精密制造集团', '陈工', '021-66661002', 'chen@jingmi.com', 'manufacturing', '500+', 'exhibition', 'important', 'deal', 3, '上海市浦东新区张江路88号', '2025-01-08 14:00:00', '2024-09-15 10:00:00'),
(3, 'C202501030003', '深圳前海金融服务公司', '王经理', '0755-33331003', 'wang@qianhai.com', 'finance', '51-100', 'referral', 'vip', 'negotiation', 4, '深圳市南山区前海路100号', '2025-01-12 09:30:00', '2024-11-01 08:00:00'),
(4, 'C202501040004', '杭州智慧教育科技', '赵老师', '0571-88881004', 'zhao@zhihui.com', 'education', '21-50', 'phone', 'normal', 'quotation', 4, '杭州市西湖区文三路200号', '2025-01-05 16:00:00', '2024-11-20 11:00:00'),
(5, 'C202501050005', '广州康健医疗器械', '孙院长', '020-88881005', 'sun@kangjian.com', 'healthcare', '101-500', 'advertisement', 'important', 'deal', 5, '广州市天河区天河路300号', '2025-01-11 11:00:00', '2024-08-10 09:00:00'),
(6, 'C202501060006', '成都天府地产开发', '周总', '028-88881006', 'zhou@tianfu.com', 'realestate', '500+', 'referral', 'vip', 'deal', 5, '成都市高新区天府大道500号', '2025-01-09 15:00:00', '2024-07-20 10:00:00'),
(7, 'C202501070007', '南京创新软件公司', '吴总监', '025-88881007', 'wu@chuangxin.com', 'it', '51-100', 'website', 'important', 'intention', 3, '南京市雨花台区软件大道50号', '2025-01-13 10:00:00', '2024-12-01 09:00:00'),
(8, 'C202501080008', '武汉光谷生物医药', '郑博士', '027-88881008', 'zheng@guanggu.com', 'healthcare', '21-50', 'exhibition', 'normal', 'potential', 4, '武汉市东湖高新区光谷大道70号', '2025-01-06 14:00:00', '2024-12-15 11:00:00'),
(9, 'C202501090009', '重庆山城机械制造', '钱厂长', '023-88881009', 'qian@shancheng.com', 'manufacturing', '101-500', 'phone', 'important', 'negotiation', 6, '重庆市渝北区龙溪路80号', '2025-01-14 09:00:00', '2024-10-20 08:00:00'),
(10, 'C202501100010', '天津滨海金融投资', '孙总', '022-88881010', 'sun@binhai.com', 'finance', '21-50', 'advertisement', 'normal', 'quotation', 6, '天津市滨海新区响螺湾60号', '2025-01-07 16:00:00', '2024-11-10 10:00:00'),
(11, 'C202501110011', '西安丝路教育集团', '马校长', '029-88881011', 'ma@silu.com', 'education', '500+', 'referral', 'vip', 'deal', 3, '西安市雁塔区科技路90号', '2025-01-15 10:00:00', '2024-06-15 09:00:00'),
(12, 'C202501120012', '苏州工业园区智造', '黄工', '0512-88881012', 'huang@zhizao.com', 'manufacturing', '101-500', 'exhibition', 'important', 'deal', 4, '苏州市工业园区星湖街100号', '2025-01-10 13:00:00', '2024-09-01 10:00:00'),
(13, 'C202501130013', '厦门海峡信息技术', '林总', '0592-88881013', 'lin@haixia.com', 'it', '21-50', 'website', 'normal', 'intention', 5, '厦门市思明区软件园二期', '2025-01-04 11:00:00', '2024-12-20 14:00:00'),
(14, 'C202501140014', '长沙麓谷健康科技', '谢总', '0731-88881014', 'xie@lugu.com', 'healthcare', '51-100', 'phone', 'normal', 'potential', 6, '长沙市岳麓区麓谷大道120号', '2025-01-03 15:00:00', '2025-01-02 09:00:00'),
(15, 'C202501150015', '青岛海信地产集团', '冯总', '0532-88881015', 'feng@haixin.com', 'realestate', '500+', 'advertisement', 'important', 'negotiation', 3, '青岛市崂山区海尔路150号', '2025-01-16 09:00:00', '2024-08-25 10:00:00');

-- 8.4 初始化销售机会（含成交数据，让行业分析有转化率）
INSERT INTO `opportunities` (`id`, `customer_id`, `name`, `amount`, `stage`, `probability`, `expected_close_date`, `owner_id`, `status`, `actual_amount`, `close_date`, `created_at`) VALUES
(1, 1, '云智科技ERP系统采购', 280000.00, 'contract', 100, '2024-12-30', 3, 'won', 265000.00, '2024-12-28', '2024-10-15 09:00:00'),
(2, 2, '精密制造MES系统项目', 520000.00, 'contract', 100, '2025-01-15', 3, 'won', 500000.00, '2025-01-12', '2024-09-20 10:00:00'),
(3, 3, '前海金融风控平台', 380000.00, 'negotiation', 70, '2025-02-28', 4, 'open', NULL, NULL, '2024-11-10 08:00:00'),
(4, 4, '智慧教育在线平台', 150000.00, 'proposal', 50, '2025-03-15', 4, 'open', NULL, NULL, '2024-12-01 11:00:00'),
(5, 5, '康健医疗信息化升级', 420000.00, 'contract', 100, '2024-11-30', 5, 'won', 410000.00, '2024-11-25', '2024-08-20 09:00:00'),
(6, 6, '天府地产智慧物业系统', 350000.00, 'contract', 100, '2024-12-20', 5, 'won', 340000.00, '2024-12-18', '2024-08-01 10:00:00'),
(7, 7, '创新软件DevOps平台', 180000.00, 'requirement', 40, '2025-04-01', 3, 'open', NULL, NULL, '2024-12-10 09:00:00'),
(8, 9, '山城机械智能产线改造', 680000.00, 'negotiation', 65, '2025-03-01', 6, 'open', NULL, NULL, '2024-10-25 08:00:00'),
(9, 11, '丝路教育数字化校园', 450000.00, 'contract', 100, '2024-09-30', 3, 'won', 430000.00, '2024-09-28', '2024-06-20 09:00:00'),
(10, 12, '苏州智造工业互联网', 320000.00, 'contract', 100, '2024-12-15', 4, 'won', 310000.00, '2024-12-10', '2024-09-10 10:00:00'),
(11, 15, '海信地产智慧社区', 550000.00, 'negotiation', 60, '2025-03-30', 3, 'open', NULL, NULL, '2024-09-01 10:00:00'),
(12, 1, '云智科技二期CRM定制', 160000.00, 'proposal', 55, '2025-02-15', 3, 'open', NULL, NULL, '2025-01-05 09:00:00'),
(13, 10, '滨海金融数据分析平台', 220000.00, 'requirement', 30, '2025-05-01', 6, 'open', NULL, NULL, '2024-11-15 10:00:00'),
(14, 2, '精密制造二期IoT监控', 380000.00, 'proposal', 50, '2025-04-15', 3, 'open', NULL, NULL, '2025-01-10 08:00:00');

-- 8.5 初始化跟进记录
INSERT INTO `followups` (`customer_id`, `user_id`, `type`, `content`, `result`, `next_plan`, `next_followup_at`, `created_at`) VALUES
(1, 3, 'phone', '与刘总沟通ERP需求细节，确认模块范围', '已确认需求', '准备方案报价', '2024-10-20 10:00:00', '2024-10-10 10:00:00'),
(1, 3, 'visit', '上门演示ERP系统，刘总满意整体方案', '演示通过', '发送正式报价', '2024-11-01 09:00:00', '2024-10-22 14:00:00'),
(1, 3, 'email', '发送正式报价方案和合同草案', '等待审批', '跟进审批进度', '2024-11-15 10:00:00', '2024-11-05 09:00:00'),
(2, 3, 'visit', '参观精密制造工厂，了解产线现状', '需求明确', '出具MES方案', '2024-10-10 10:00:00', '2024-09-25 09:00:00'),
(2, 3, 'phone', '讨论MES系统集成方案和时间表', '方案认可', '安排签约', '2024-12-20 10:00:00', '2024-12-05 14:00:00'),
(3, 4, 'phone', '初次联系前海金融，了解风控需求', '有明确需求', '安排上门拜访', '2024-11-20 10:00:00', '2024-11-05 09:30:00'),
(3, 4, 'visit', '上门演示风控平台，讨论定制化需求', '需要定制开发', '出具定制方案', '2024-12-10 14:00:00', '2024-11-25 10:00:00'),
(3, 4, 'wechat', '微信沟通报价细节和实施周期', '价格基本认可', '安排商务谈判', '2025-01-15 09:00:00', '2025-01-12 09:30:00'),
(4, 4, 'phone', '电话沟通在线教育平台功能需求', '需求初步明确', '发送功能清单确认', '2024-12-15 10:00:00', '2024-12-05 16:00:00'),
(5, 5, 'visit', '拜访康健医疗，演示信息化方案', '方案获认可', '准备合同', '2024-09-20 10:00:00', '2024-09-05 11:00:00'),
(5, 5, 'phone', '确认合同条款和实施计划', '合同确认', '安排签约', '2024-11-10 09:00:00', '2024-10-28 14:00:00'),
(6, 5, 'visit', '拜访天府地产总部，了解物业管理痛点', '痛点明确', '出具智慧物业方案', '2024-08-20 10:00:00', '2024-08-10 09:00:00'),
(6, 5, 'email', '发送智慧物业系统方案书', '方案通过', '商务谈判', '2024-10-01 10:00:00', '2024-09-15 10:00:00'),
(7, 3, 'phone', '与创新软件吴总监初步沟通DevOps需求', '有兴趣', '发送产品资料', '2024-12-20 10:00:00', '2024-12-10 10:00:00'),
(9, 6, 'visit', '拜访山城机械，考察产线自动化现状', '需求复杂', '出具改造方案', '2024-11-10 09:00:00', '2024-10-28 09:00:00'),
(9, 6, 'phone', '讨论智能产线改造方案和预算', '预算需审批', '等待审批结果', '2025-01-20 10:00:00', '2025-01-14 09:00:00'),
(11, 3, 'visit', '拜访丝路教育集团总部，演示数字化校园方案', '非常满意', '准备合同', '2024-07-15 10:00:00', '2024-07-01 09:00:00'),
(11, 3, 'email', '发送合同和实施计划', '合同签订', '启动项目', '2024-09-30 09:00:00', '2024-09-20 10:00:00'),
(12, 4, 'visit', '苏州智造工厂实地考察，确认工业互联网需求', '需求确认', '出具方案', '2024-10-01 10:00:00', '2024-09-20 09:00:00'),
(12, 4, 'wechat', '微信沟通方案细节和报价', '报价认可', '安排签约', '2024-12-01 10:00:00', '2024-11-20 14:00:00'),
(15, 3, 'phone', '与海信地产冯总沟通智慧社区需求', '需求明确', '准备方案', '2024-09-15 10:00:00', '2024-09-05 09:00:00'),
(15, 3, 'visit', '上门演示智慧社区解决方案', '方案基本认可', '商务谈判', '2025-01-20 10:00:00', '2025-01-16 09:00:00');

-- =============================================
-- 结束
-- =============================================
