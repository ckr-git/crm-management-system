const { validationResult } = require('express-validator');
const { models } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { isAdmin } = require('../utils/access');

// 管理员权限检查中间件
const requireAdmin = (req, res, next) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ code: 403, message: '需要管理员权限' });
  }
  if (typeof next === 'function') next();
  return true;
};

/**
 * 获取当前登录用户信息
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['id', 'name', 'code', 'description']
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: user
    });
  } catch (error) {
    console.error('获取当前用户信息错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取用户列表（分页和搜索）- 仅管理员
 */
exports.getUsers = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    
    const {
      page = 1,
      pageSize = 10,
      name = '',
      username = '',
      role_id = '',
      status = ''
    } = req.query;

    // 构建查询条件
    const where = {};
    
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (username) {
      where.username = { [Op.like]: `%${username}%` };
    }
    if (role_id) {
      where.role_id = role_id;
    }
    if (status !== '') {
      where.status = parseInt(status);
    }

    // 分页参数
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 查询用户列表
    const { count, rows } = await models.User.findAndCountAll({
      where,
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['id', 'name', 'code']
      }],
      attributes: { exclude: ['password'] }, // 不返回密码
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取用户详情 - 仅管理员
 */
exports.getUserById = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    
    const { id } = req.params;

    const user = await models.User.findByPk(id, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['id', 'name', 'code', 'description']
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: user
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 创建用户 - 仅管理员
 */
exports.createUser = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      });
    }

    const {
      username,
      password,
      name,
      email,
      phone,
      role_id,
      department_id,
      manager_id
    } = req.body;

    // 检查用户名是否已存在（仅检查未删除的用户）
    const existUser = await models.User.findOne({
      where: { 
        username,
        deleted_at: null 
      }
    });

    if (existUser) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在'
      });
    }

    // 如果存在已软删除的同名用户，先物理删除（避免唯一索引冲突）
    const deletedUser = await models.User.findOne({
      where: { username },
      paranoid: false  // 包括软删除的记录
    });
    
    if (deletedUser && deletedUser.deleted_at !== null) {
      // 物理删除该用户
      await deletedUser.destroy({ force: true });
    }

    // 验证角色是否存在
    const role = await models.Role.findByPk(role_id);
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在'
      });
    }

    // 创建用户（密码会被 User 模型的 setter 自动哈希）
    const user = await models.User.create({
      username,
      password,  // 直接使用明文密码，模型 setter 会自动加密
      name,
      email,
      phone,
      role_id,
      department_id,
      manager_id,
      status: 1 // 默认启用
    });

    // 返回用户信息（不包含密码）
    const userInfo = await models.User.findByPk(user.id, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['id', 'name', 'code']
      }],
      attributes: { exclude: ['password'] }
    });

    res.json({
      code: 200,
      message: '创建成功',
      data: userInfo
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 更新用户信息 - 仅管理员
 */
exports.updateUser = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    
    const { id } = req.params;
    
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      });
    }

    const user = await models.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    const {
      name,
      email,
      phone,
      role_id,
      department_id,
      manager_id
    } = req.body;

    // 如果修改角色，验证角色是否存在
    if (role_id && role_id !== user.role_id) {
      const role = await models.Role.findByPk(role_id);
      if (!role) {
        return res.status(404).json({
          code: 404,
          message: '角色不存在'
        });
      }
    }

    // 更新用户信息（不更新用户名和密码）
    await user.update({
      name: name || user.name,
      email,
      phone,
      role_id: role_id || user.role_id,
      department_id,
      manager_id
    });

    // 返回更新后的用户信息
    const userInfo = await models.User.findByPk(id, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['id', 'name', 'code']
      }],
      attributes: { exclude: ['password'] }
    });

    res.json({
      code: 200,
      message: '更新成功',
      data: userInfo
    });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 删除用户（软删除）- 仅管理员
 */
exports.deleteUser = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    
    const { id } = req.params;

    const user = await models.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 不能删除自己
    if (user.id === req.user.id) {
      return res.status(400).json({
        code: 400,
        message: '不能删除自己'
      });
    }

    // 不能删除管理员账号
    if (user.role_id === 1) {
      return res.status(400).json({
        code: 400,
        message: '不能删除管理员账号'
      });
    }

    // 软删除
    await user.destroy();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 启用/禁用用户 - 仅管理员
 */
exports.updateUserStatus = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    
    const { id } = req.params;
    const { status } = req.body;

    const user = await models.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 不能禁用自己
    if (user.id === req.user.id && status === 0) {
      return res.status(400).json({
        code: 400,
        message: '不能禁用自己'
      });
    }

    // 不能禁用管理员账号
    if (user.role_id === 1 && status === 0) {
      return res.status(400).json({
        code: 400,
        message: '不能禁用管理员账号'
      });
    }

    // 更新状态
    await user.update({ status: parseInt(status) });

    res.json({
      code: 200,
      message: status === 1 ? '用户已启用' : '用户已禁用',
      data: {
        id: user.id,
        status: user.status
      }
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 重置用户密码 - 仅管理员
 */
exports.resetPassword = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ code: 400, message: '请提供新密码' });
    }
    const password = new_password;

    const user = await models.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 更新密码（密码会被 User 模型的 setter 自动哈希）
    await user.update({ password });

    // 发送密码重置通知给用户
    try {
      const operatorName = req.user?.name || req.user?.username || '管理员';
      await models.Notification.create({
        user_id: user.id,
        type: 'system',
        title: '密码重置通知',
        content: `您的账号密码已被 ${operatorName} 重置，请尽快登录并修改密码。如非本人操作，请立即联系管理员。`,
        link: null,
        sender_id: req.user?.id || req.user?.userId || null,
        extra_data: {
          reset_time: new Date().toISOString(),
          operator: operatorName
        }
      });
    } catch (notifyError) {
      console.error('发送密码重置通知失败:', notifyError);
      // 通知失败不影响密码重置操作
    }

    res.json({
      code: 200,
      message: '密码重置成功，已发送通知给用户'
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取当前用户可管理的用户列表（用于客户转移等场景）
 */
exports.getAvailableUsers = async (req, res) => {
  try {
    // 查询所有用户（包括禁用的，用于日志筛选）
    const users = await models.User.findAll({
      attributes: ['id', 'name', 'username'],
      order: [['name', 'ASC']]
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: users
    });
  } catch (error) {
    console.error('获取可用用户列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};
