const { models } = require('../models');
const { Op } = require('sequelize');
const { isAdmin } = require('../utils/access');

// 管理员权限检查
const requireAdmin = (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ code: 403, message: '需要管理员权限' });
    return false;
  }
  return true;
};

/**
 * 预定义权限数据（树形结构）
 * 实际项目中应该从数据库读取
 */
const PERMISSIONS_TREE = [
  {
    id: 1,
    name: '客户管理',
    code: 'customer',
    children: [
      { id: 11, name: '查看客户', code: 'customer:read' },
      { id: 12, name: '创建客户', code: 'customer:create' },
      { id: 13, name: '编辑客户', code: 'customer:update' },
      { id: 14, name: '删除客户', code: 'customer:delete' },
      { id: 15, name: '导出客户', code: 'customer:export' },
      { id: 16, name: '转移客户', code: 'customer:transfer' }
    ]
  },
  {
    id: 2,
    name: '跟进记录',
    code: 'followup',
    children: [
      { id: 21, name: '查看跟进', code: 'followup:read' },
      { id: 22, name: '创建跟进', code: 'followup:create' },
      { id: 23, name: '编辑跟进', code: 'followup:update' },
      { id: 24, name: '删除跟进', code: 'followup:delete' }
    ]
  },
  {
    id: 3,
    name: '销售机会',
    code: 'opportunity',
    children: [
      { id: 31, name: '查看机会', code: 'opportunity:read' },
      { id: 32, name: '创建机会', code: 'opportunity:create' },
      { id: 33, name: '编辑机会', code: 'opportunity:update' },
      { id: 34, name: '删除机会', code: 'opportunity:delete' },
      { id: 35, name: '赢单/输单', code: 'opportunity:close' }
    ]
  },
  {
    id: 4,
    name: '客户公海',
    code: 'pool',
    children: [
      { id: 41, name: '查看公海', code: 'pool:read' },
      { id: 42, name: '领取客户', code: 'pool:claim' },
      { id: 43, name: '释放客户', code: 'pool:release' }
    ]
  },
  {
    id: 5,
    name: '数据分析',
    code: 'analysis',
    children: [
      { id: 51, name: '查看分析', code: 'analysis:read' },
      { id: 52, name: '导出报表', code: 'analysis:export' }
    ]
  },
  {
    id: 6,
    name: '用户管理',
    code: 'user',
    children: [
      { id: 61, name: '查看用户', code: 'user:read' },
      { id: 62, name: '创建用户', code: 'user:create' },
      { id: 63, name: '编辑用户', code: 'user:update' },
      { id: 64, name: '删除用户', code: 'user:delete' },
      { id: 65, name: '重置密码', code: 'user:reset' }
    ]
  },
  {
    id: 7,
    name: '角色管理',
    code: 'role',
    children: [
      { id: 71, name: '查看角色', code: 'role:read' },
      { id: 72, name: '创建角色', code: 'role:create' },
      { id: 73, name: '编辑角色', code: 'role:update' },
      { id: 74, name: '删除角色', code: 'role:delete' },
      { id: 75, name: '配置权限', code: 'role:permission' }
    ]
  }
];

// 预定义角色权限映射
const ROLE_PERMISSIONS = {
  1: [11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 31, 32, 33, 34, 35, 41, 42, 43, 51, 52, 61, 62, 63, 64, 65, 71, 72, 73, 74, 75], // 管理员：所有权限
  2: [11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 31, 32, 33, 34, 35, 41, 42, 43, 51, 52], // 销售经理：客户、跟进、机会、公海、分析
  3: [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42], // 销售人员：基础操作，无删除权限
  4: [11, 21, 31, 51] // 财务：只能查看
};

/**
 * 获取权限列表（树形结构）
 */
exports.getPermissions = async (req, res) => {
  try {
    // 先尝试从数据库获取
    const permissions = await models.Permission.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    });

    // 如果数据库为空，返回预定义数据
    if (permissions.length === 0) {
      return res.json({
        code: 200,
        message: '获取成功',
        data: PERMISSIONS_TREE
      });
    }

    // 构建树形结构
    const permissionMap = {};
    const tree = [];

    permissions.forEach(perm => {
      permissionMap[perm.id] = {
        id: perm.id,
        name: perm.name,
        code: perm.code,
        type: perm.type,
        parent_id: perm.parent_id,
        children: []
      };
    });

    permissions.forEach(perm => {
      if (perm.parent_id === null) {
        tree.push(permissionMap[perm.id]);
      } else if (permissionMap[perm.parent_id]) {
        permissionMap[perm.parent_id].children.push(permissionMap[perm.id]);
      }
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: tree
    });
  } catch (error) {
    console.error('获取权限列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 获取角色的权限
 */
exports.getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;

    // 获取角色信息及其权限
    const role = await models.Role.findByPk(id, {
      include: [{
        model: models.Permission,
        as: 'permissions',
        attributes: ['id'],
        through: { attributes: [] }
      }]
    });

    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在'
      });
    }

    // 提取权限ID数组
    const permissionIds = role.permissions ? role.permissions.map(p => p.id) : [];

    res.json({
      code: 200,
      message: '获取成功',
      data: permissionIds
    });
  } catch (error) {
    console.error('获取角色权限错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 更新角色权限 - 仅管理员
 */
exports.updateRolePermissions = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const { permission_ids } = req.body;

    // 获取角色信息
    const role = await models.Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在'
      });
    }

    // 系统角色（管理员）不允许修改权限
    if (role.id === 1 && role.is_system === 1) {
      return res.status(400).json({
        code: 400,
        message: '系统管理员角色权限不可修改'
      });
    }

    // 验证权限ID
    if (!Array.isArray(permission_ids)) {
      return res.status(400).json({
        code: 400,
        message: '权限ID必须是数组'
      });
    }

    // 删除旧的权限关联
    await models.RolePermission.destroy({
      where: { role_id: id }
    });

    // 创建新的权限关联
    if (permission_ids.length > 0) {
      const rolePermissions = permission_ids.map(permId => ({
        role_id: parseInt(id),
        permission_id: parseInt(permId)
      }));
      
      await models.RolePermission.bulkCreate(rolePermissions);
    }

    // 发送通知给使用该角色的用户
    try {
      const affectedUsers = await models.User.findAll({
        where: { 
          role_id: id,
          status: 1 // 只通知启用的用户
        },
        attributes: ['id', 'name']
      });

      const operatorName = req.user?.name || req.user?.username || '管理员';
      
      if (affectedUsers.length > 0) {
        const notifications = affectedUsers.map(user => ({
          user_id: user.id,
          type: 'system',
          title: '权限变更通知',
          content: `您的角色【${role.name}】的权限已被 ${operatorName} 更新，请刷新页面以获取最新权限。`,
          link: null,
          sender_id: req.user?.id || req.user?.userId || null,
          extra_data: {
            role_id: id,
            role_name: role.name,
            update_time: new Date().toISOString(),
            action: 'permission_updated'
          }
        }));
        
        await models.Notification.bulkCreate(notifications);
      }
    } catch (notifyError) {
      console.error('发送权限更新通知失败:', notifyError);
      // 通知失败不影响权限更新操作
    }

    res.json({
      code: 200,
      message: '权限配置成功',
      data: {
        role_id: id,
        permission_ids
      }
    });
  } catch (error) {
    console.error('更新角色权限错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};
