const { models } = require('../models');
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
 * 获取角色列表
 */
exports.getRoles = async (req, res) => {
  try {
    const roles = await models.Role.findAll({
      where: { status: 1 },
      order: [['id', 'ASC']]
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: roles
    });
  } catch (error) {
    console.error('获取角色列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取角色详情
 */
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await models.Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: role
    });
  } catch (error) {
    console.error('获取角色详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 创建角色 - 仅管理员
 */
exports.createRole = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    console.log('📝 创建角色请求:', req.body);
    const { name, code, description } = req.body;

    // 验证必填字段
    if (!name || !code) {
      console.log('❌ 验证失败: 缺少必填字段');
      return res.status(400).json({
        code: 400,
        message: '角色名称和代码不能为空'
      });
    }

    // 检查角色代码是否已存在
    console.log('🔍 检查角色代码是否存在:', code);
    const existRole = await models.Role.findOne({
      where: { code }
    });

    if (existRole) {
      console.log('❌ 角色代码已存在');
      return res.status(400).json({
        code: 400,
        message: '角色代码已存在'
      });
    }

    // 创建角色
    console.log('✅ 开始创建角色...');
    const role = await models.Role.create({
      name,
      code,
      description: description || '',
      is_system: 0,
      status: 1
    });

    console.log('✅ 角色创建成功:', role.id);
    res.json({
      code: 200,
      message: '创建成功',
      data: role
    });
  } catch (error) {
    console.error('❌❌❌ 创建角色错误详情 ❌❌❌');
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('请求数据:', req.body);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 更新角色 - 仅管理员
 */
exports.updateRole = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const { name, description, status } = req.body;

    const role = await models.Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在'
      });
    }

    // 系统角色不能修改代码
    if (role.is_system && req.body.code) {
      return res.status(400).json({
        code: 400,
        message: '系统角色不能修改代码'
      });
    }

    // 更新角色信息
    await role.update({
      name: name || role.name,
      description,
      status: status !== undefined ? status : role.status
    });

    res.json({
      code: 200,
      message: '更新成功',
      data: role
    });
  } catch (error) {
    console.error('更新角色错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 删除角色 - 仅管理员
 */
exports.deleteRole = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;

    const role = await models.Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在'
      });
    }

    // 系统角色不能删除
    if (role.is_system) {
      return res.status(400).json({
        code: 400,
        message: '系统角色不能删除'
      });
    }

    // 检查是否有用户使用此角色
    const userCount = await models.User.count({
      where: { role_id: id }
    });

    if (userCount > 0) {
      return res.status(400).json({
        code: 400,
        message: `该角色下还有${userCount}个用户，无法删除`
      });
    }

    // 删除角色
    await role.destroy();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除角色错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};
