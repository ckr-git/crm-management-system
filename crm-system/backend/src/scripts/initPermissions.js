/**
 * 初始化权限数据
 */
const { models, sequelize } = require('../models');

const permissions = [
  // 客户管理模块
  { id: 1, parent_id: null, name: '客户管理', code: 'customer', type: 'module', sort_order: 1 },
  { id: 11, parent_id: 1, name: '查看客户', code: 'customer:read', type: 'action', sort_order: 1 },
  { id: 12, parent_id: 1, name: '创建客户', code: 'customer:create', type: 'action', sort_order: 2 },
  { id: 13, parent_id: 1, name: '编辑客户', code: 'customer:update', type: 'action', sort_order: 3 },
  { id: 14, parent_id: 1, name: '删除客户', code: 'customer:delete', type: 'action', sort_order: 4 },
  { id: 15, parent_id: 1, name: '导出客户', code: 'customer:export', type: 'action', sort_order: 5 },
  { id: 16, parent_id: 1, name: '转移客户', code: 'customer:transfer', type: 'action', sort_order: 6 },

  // 跟进记录模块
  { id: 2, parent_id: null, name: '跟进记录', code: 'followup', type: 'module', sort_order: 2 },
  { id: 21, parent_id: 2, name: '查看跟进', code: 'followup:read', type: 'action', sort_order: 1 },
  { id: 22, parent_id: 2, name: '创建跟进', code: 'followup:create', type: 'action', sort_order: 2 },
  { id: 23, parent_id: 2, name: '编辑跟进', code: 'followup:update', type: 'action', sort_order: 3 },
  { id: 24, parent_id: 2, name: '删除跟进', code: 'followup:delete', type: 'action', sort_order: 4 },

  // 销售机会模块
  { id: 3, parent_id: null, name: '销售机会', code: 'opportunity', type: 'module', sort_order: 3 },
  { id: 31, parent_id: 3, name: '查看机会', code: 'opportunity:read', type: 'action', sort_order: 1 },
  { id: 32, parent_id: 3, name: '创建机会', code: 'opportunity:create', type: 'action', sort_order: 2 },
  { id: 33, parent_id: 3, name: '编辑机会', code: 'opportunity:update', type: 'action', sort_order: 3 },
  { id: 34, parent_id: 3, name: '删除机会', code: 'opportunity:delete', type: 'action', sort_order: 4 },
  { id: 35, parent_id: 3, name: '赢单/输单', code: 'opportunity:close', type: 'action', sort_order: 5 },

  // 客户公海模块
  { id: 4, parent_id: null, name: '客户公海', code: 'pool', type: 'module', sort_order: 4 },
  { id: 41, parent_id: 4, name: '查看公海', code: 'pool:read', type: 'action', sort_order: 1 },
  { id: 42, parent_id: 4, name: '领取客户', code: 'pool:claim', type: 'action', sort_order: 2 },
  { id: 43, parent_id: 4, name: '释放客户', code: 'pool:release', type: 'action', sort_order: 3 },

  // 数据分析模块
  { id: 5, parent_id: null, name: '数据分析', code: 'analysis', type: 'module', sort_order: 5 },
  { id: 51, parent_id: 5, name: '查看报表', code: 'analysis:read', type: 'action', sort_order: 1 },
  { id: 52, parent_id: 5, name: '导出报表', code: 'analysis:export', type: 'action', sort_order: 2 },

  // 用户管理模块
  { id: 6, parent_id: null, name: '用户管理', code: 'user', type: 'module', sort_order: 6 },
  { id: 61, parent_id: 6, name: '查看用户', code: 'user:read', type: 'action', sort_order: 1 },
  { id: 62, parent_id: 6, name: '创建用户', code: 'user:create', type: 'action', sort_order: 2 },
  { id: 63, parent_id: 6, name: '编辑用户', code: 'user:update', type: 'action', sort_order: 3 },
  { id: 64, parent_id: 6, name: '删除用户', code: 'user:delete', type: 'action', sort_order: 4 },
  { id: 65, parent_id: 6, name: '重置密码', code: 'user:reset', type: 'action', sort_order: 5 },

  // 角色管理模块
  { id: 7, parent_id: null, name: '角色管理', code: 'role', type: 'module', sort_order: 7 },
  { id: 71, parent_id: 7, name: '查看角色', code: 'role:read', type: 'action', sort_order: 1 },
  { id: 72, parent_id: 7, name: '创建角色', code: 'role:create', type: 'action', sort_order: 2 },
  { id: 73, parent_id: 7, name: '编辑角色', code: 'role:update', type: 'action', sort_order: 3 },
  { id: 74, parent_id: 7, name: '删除角色', code: 'role:delete', type: 'action', sort_order: 4 },
  { id: 75, parent_id: 7, name: '配置权限', code: 'role:permission', type: 'action', sort_order: 5 }
];

// 预定义角色权限
const rolePermissions = [
  // 管理员：所有权限
  { role_id: 1, permissions: [11,12,13,14,15,16,21,22,23,24,31,32,33,34,35,41,42,43,51,52,61,62,63,64,65,71,72,73,74,75] },
  // 销售经理：客户、跟进、机会、公海、分析
  { role_id: 2, permissions: [11,12,13,14,15,16,21,22,23,24,31,32,33,34,35,41,42,43,51,52] },
  // 销售人员：基础操作，无删除权限
  { role_id: 3, permissions: [11,12,13,21,22,23,31,32,33,41,42] },
  // 财务：只能查看
  { role_id: 4, permissions: [11,21,31,51] }
];

async function initPermissions() {
  try {
    console.log('开始初始化权限数据...');

    // 检查是否已有数据
    const count = await models.Permission.count();
    if (count > 0) {
      console.log(`⚠️  权限表已有 ${count} 条数据，跳过初始化`);
      console.log('如需重新初始化，请先手动清空 permissions 和 role_permissions 表');
      return;
    }

    // 插入权限数据
    console.log('插入权限数据...');
    await models.Permission.bulkCreate(permissions);
    console.log(`✅ 成功插入 ${permissions.length} 条权限数据`);

    // 插入角色权限关联
    console.log('插入角色权限关联...');
    let totalAssigned = 0;
    for (const rp of rolePermissions) {
      const records = rp.permissions.map(permId => ({
        role_id: rp.role_id,
        permission_id: permId
      }));
      await models.RolePermission.bulkCreate(records);
      totalAssigned += records.length;
      console.log(`  ✅ 角色${rp.role_id} 分配了 ${records.length} 个权限`);
    }
    console.log(`✅ 成功插入 ${totalAssigned} 条角色权限关联`);

    console.log('\n🎉 权限数据初始化完成！');
    console.log('现在可以使用权限配置功能了');

  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  }
}

// 执行初始化
initPermissions()
  .then(() => {
    console.log('\n✅ 脚本执行成功');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });
