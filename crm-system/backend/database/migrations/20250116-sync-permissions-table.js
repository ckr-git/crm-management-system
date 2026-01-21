'use strict';

/**
 * 同步permissions表结构
 * 
 * 问题：init.sql中有resource和action字段，但Sequelize模型中使用了type和parent_id
 * 解决：统一使用Sequelize模型的结构（type, parent_id, sort_order）
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 1. 检查permissions表是否存在
      const tables = await queryInterface.showAllTables();
      const hasPermissionsTable = tables.includes('permissions');
      
      if (hasPermissionsTable) {
        // 2. 获取当前列信息
        const tableInfo = await queryInterface.describeTable('permissions');
        
        // 3. 如果有resource和action列，删除它们
        if (tableInfo.resource) {
          await queryInterface.removeColumn('permissions', 'resource', { transaction });
        }
        if (tableInfo.action) {
          await queryInterface.removeColumn('permissions', 'action', { transaction });
        }
        if (tableInfo.description) {
          await queryInterface.removeColumn('permissions', 'description', { transaction });
        }
        
        // 4. 添加Sequelize模型需要的字段
        if (!tableInfo.type) {
          await queryInterface.addColumn('permissions', 'type', {
            type: Sequelize.STRING(20),
            defaultValue: 'action',
            comment: '权限类型：module模块 action操作'
          }, { transaction });
        }
        
        if (!tableInfo.sort_order) {
          await queryInterface.addColumn('permissions', 'sort_order', {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            comment: '排序'
          }, { transaction });
        }
        
        // 5. 更新updated_at字段（如果不存在）
        if (!tableInfo.updatedAt && !tableInfo.updated_at) {
          await queryInterface.addColumn('permissions', 'updated_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
          }, { transaction });
        }
      }
      
      await transaction.commit();
      console.log('✅ permissions表结构同步完成');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ permissions表结构同步失败:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 回滚到init.sql的结构
      const tableInfo = await queryInterface.describeTable('permissions');
      
      // 添加回resource和action字段
      if (!tableInfo.resource) {
        await queryInterface.addColumn('permissions', 'resource', {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: '资源类型'
        }, { transaction });
      }
      
      if (!tableInfo.action) {
        await queryInterface.addColumn('permissions', 'action', {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: '操作类型'
        }, { transaction });
      }
      
      if (!tableInfo.description) {
        await queryInterface.addColumn('permissions', 'description', {
          type: Sequelize.STRING(200),
          allowNull: true,
          comment: '权限描述'
        }, { transaction });
      }
      
      // 删除Sequelize模型的字段
      if (tableInfo.type) {
        await queryInterface.removeColumn('permissions', 'type', { transaction });
      }
      
      if (tableInfo.sort_order) {
        await queryInterface.removeColumn('permissions', 'sort_order', { transaction });
      }
      
      await transaction.commit();
      console.log('✅ permissions表结构已回滚');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ permissions表结构回滚失败:', error.message);
      throw error;
    }
  }
};
