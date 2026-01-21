const { validationResult } = require('express-validator');
const { models } = require('../models');
const { Op } = require('sequelize');
const notificationController = require('./notificationController');

/**
 * 获取客户列表（带分页和搜索）
 */
const { ensureUserContext, isAdmin } = require('../utils/access')

exports.getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      name = '',
      contact = '',
      phone = '',
      stage = '',
      level = '',
      source = '',
      onlyMine = 'true'  // 默认只显示我的客户
    } = req.query;

    await ensureUserContext(req)

    // 构建查询条件（非管理员强制仅看自己）
    const where = {}
    if (isAdmin(req)) {
      if (onlyMine === 'true') {
        where.owner_id = req.user.id
      } else {
        where.owner_id = { [Op.ne]: null }
      }
    } else {
      where.owner_id = req.user.id
    }
    
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (contact) {
      where.contact = { [Op.like]: `%${contact}%` };
    }
    if (phone) {
      where.phone = { [Op.like]: `%${phone}%` };
    }
    if (stage) {
      where.stage = stage;
    }
    if (level) {
      where.level = level;
    }
    if (source) {
      where.source = source;
    }

    // 分页参数
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 查询客户列表
    const { count, rows } = await models.Customer.findAndCountAll({
      where,
      include: [{
        model: models.User,
        as: 'owner',
        attributes: ['id', 'name', 'username']
      }],
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
    console.error('获取客户列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 创建客户
 */
const dayjs = require('dayjs')

exports.createCustomer = async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      });
    }

    const {
      name,
      short_name,
      credit_code,
      contact,
      position,
      phone,
      mobile,
      email,
      wechat,
      qq,
      address,
      website,
      industry,
      company_size,
      source,
      level = 'normal',
      stage = 'potential',
      tags,
      remark,
      owner_id,
      next_followup_at
    } = req.body;

    // 检查是否已存在同名客户（公司名称+电话）
    const existCustomer = await models.Customer.findOne({
      where: { name, phone },
      paranoid: true
    });

    if (existCustomer) {
      return res.status(400).json({
        code: 400,
        message: '该客户已存在（公司名称+电话重复）'
      });
    }

    // 检查手机号（phone）是否重复
    if (phone) {
      const existedPhone = await models.Customer.findOne({ where: { phone } })
      if (existedPhone) {
        return res.status(400).json({ code: 400, message: '手机号已存在' })
      }
    }

    // 检查手机号码（mobile）是否重复
    if (mobile) {
      const existedMobile = await models.Customer.findOne({ where: { mobile } })
      if (existedMobile) {
        return res.status(400).json({ code: 400, message: '手机号码已存在' })
      }
    }

    // 生成客户编号：C+YYYYMMDD+4位流水号
    const today = dayjs().format('YYYYMMDD')
    const prefix = `C${today}`
    const latest = await models.Customer.findOne({
      where: { code: { [Op.like]: `${prefix}%` } },
      attributes: ['code'],
      order: [['code', 'DESC']],
      paranoid: false
    })
    let seq = 1
    if (latest && latest.code && latest.code.startsWith(prefix)) {
      const tail = latest.code.slice(-4)
      const num = parseInt(tail, 10)
      if (!isNaN(num)) seq = num + 1
    }
    const code = `${prefix}${String(seq).padStart(4, '0')}`

    // 创建客户
    const customer = await models.Customer.create({
      code,
      name,
      short_name,
      credit_code,
      contact,
      position,
      phone,
      mobile,
      email,
      wechat,
      qq,
      address,
      website,
      industry,
      company_size,
      source,
      level,
      stage,
      tags: tags ? JSON.parse(tags) : null,
      remark,
      owner_id: owner_id || req.user.id, // 默认为当前登录用户
      next_followup_at
    });

    res.json({
      code: 200,
      message: '创建成功',
      data: customer
    });
  } catch (error) {
    console.error('创建客户错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 获取客户详情
 */
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    await ensureUserContext(req)

    const customer = await models.Customer.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'owner',
          attributes: ['id', 'name', 'username', 'email', 'phone']
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在'
      });
    }

    // 数据范围校验：仅管理员或负责人可读
    if (!isAdmin(req) && customer.owner_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权限查看该客户' })
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: customer
    });
  } catch (error) {
    console.error('获取客户详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 更新客户
 */
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      });
    }

    await ensureUserContext(req)

    const customer = await models.Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在'
      });
    }

    const {
      name,
      short_name,
      credit_code,
      contact,
      position,
      phone,
      mobile,
      email,
      wechat,
      qq,
      address,
      website,
      industry,
      company_size,
      source,
      level,
      stage,
      tags,
      remark,
      owner_id,
      next_followup_at
    } = req.body;

    // 记录旧的负责人ID
    const oldOwnerId = customer.owner_id;

    // 数据范围校验：仅管理员或负责人可改
    if (!isAdmin(req) && customer.owner_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权限修改该客户' })
    }

    // 重复手机号校验（排除自己）
    if (phone && phone !== customer.phone) {
      const existedPhone = await models.Customer.findOne({ where: { phone, id: { [Op.ne]: customer.id } } })
      if (existedPhone) {
        return res.status(400).json({ code: 400, message: '手机号已存在' })
      }
    }
    if (mobile && mobile !== customer.mobile) {
      const existedMobile = await models.Customer.findOne({ where: { mobile, id: { [Op.ne]: customer.id } } })
      if (existedMobile) {
        return res.status(400).json({ code: 400, message: '手机号码已存在' })
      }
    }

    // 更新客户信息
    await customer.update({
      name: name || customer.name,
      short_name,
      credit_code,
      contact: contact || customer.contact,
      position,
      phone: phone || customer.phone,
      mobile,
      email,
      wechat,
      qq,
      address,
      website,
      industry,
      company_size,
      source: source || customer.source,
      level,
      stage,
      tags: tags ? JSON.parse(tags) : customer.tags,
      remark,
      owner_id: owner_id || customer.owner_id,
      next_followup_at
    });

    // 如果更换了负责人，发送通知
    if (owner_id && owner_id !== oldOwnerId) {
      try {
        const operator = await models.User.findByPk(req.user.id);
        await notificationController.sendCustomerAssignNotification(
          id,
          owner_id,
          operator?.name || operator?.username || '系统管理员'
        );
        console.log(`✅ 客户分配通知已发送：客户ID=${id}, 新负责人=${owner_id}`);
      } catch (error) {
        console.error('发送客户分配通知失败:', error);
      }
    }

    res.json({
      code: 200,
      message: '更新成功',
      data: customer
    });
  } catch (error) {
    console.error('更新客户错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 删除客户（软删除）
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    await ensureUserContext(req)

    const customer = await models.Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在'
      });
    }

    // 数据范围校验：仅管理员或负责人可删
    if (!isAdmin(req) && customer.owner_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权限删除该客户' })
    }

    // 软删除
    await customer.destroy();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除客户错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 批量删除客户 - 仅能删除自己负责的客户（管理员可删除全部）
 */
exports.batchDeleteCustomers = async (req, res) => {
  try {
    await ensureUserContext(req)
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要删除的客户'
      });
    }

    // 构建权限过滤条件
    const whereCondition = { id: { [Op.in]: ids } };
    if (!isAdmin(req)) {
      // 非管理员只能删除自己负责的客户
      whereCondition.owner_id = req.user.id;
    }

    // 批量软删除
    const deletedCount = await models.Customer.destroy({
      where: whereCondition
    });

    res.json({
      code: 200,
      message: `成功删除${deletedCount}个客户`
    });
  } catch (error) {
    console.error('批量删除客户错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 导出客户到Excel
 */
exports.exportCustomers = async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const {
      name = '',
      contact = '',
      phone = '',
      stage = '',
      level = '',
      source = '',
      onlyMine = 'true'
    } = req.query;

    await ensureUserContext(req)
    // 构建查询条件（与列表相同，非管理员强制仅看自己）
    const where = {}
    if (isAdmin(req)) {
      if (onlyMine === 'true') {
        where.owner_id = req.user.id
      } else {
        where.owner_id = { [Op.ne]: null }
      }
    } else {
      where.owner_id = req.user.id
    }
    
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (contact) where.contact = { [Op.like]: `%${contact}%` };
    if (phone) where.phone = { [Op.like]: `%${phone}%` };
    if (stage) where.stage = stage;
    if (level) where.level = level;
    if (source) where.source = source;

    // 查询所有符合条件的客户
    const customers = await models.Customer.findAll({
      where,
      include: [{
        model: models.User,
        as: 'owner',
        attributes: ['name']
      }],
      order: [['created_at', 'DESC']]
    });

    // 准备Excel数据
    const excelData = customers.map(customer => ({
      '客户编号': customer.code,
      '客户名称': customer.name,
      '简称': customer.short_name || '',
'统一社会信用代码': customer.credit_code || '',
      '联系人': customer.contact,
      '职位': customer.position || '',
      '电话': customer.phone,
      '手机': customer.mobile || '',
      '邮箱': customer.email || '',
      '微信': customer.wechat || '',
      'QQ': customer.qq || '',
      '地址': customer.address || '',
      '网站': customer.website || '',
      '行业': customer.industry || '',
      '公司规模': customer.company_size || '',
      '客户来源': customer.source || '',
      '客户等级': customer.level || '',
      '客户阶段': customer.stage || '',
      '负责人': customer.owner?.name || '',
      '备注': customer.remark || ''
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 10 },
      { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 20 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, '客户列表');

    // 生成Buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=customers_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    console.error('导出客户错误:', error);
    res.status(500).json({
      code: 500,
      message: '导出失败'
    });
  }
};

/**
 * 下载导入模板
 */
exports.downloadTemplate = async (req, res) => {
  try {
    const XLSX = require('xlsx');

    // 模板数据（示例行）
    const templateData = [{
      '客户名称*': '示例科技有限公司',
      '简称': '示例科技',
      '统一社会信用代码': '91110000XXXXXXXX',
      '联系人*': '张三',
      '职位': '总经理',
      '电话*': '010-12345678',
      '手机': '13800138000',
      '邮箱': 'zhangsan@example.com',
      '微信': 'zhangsan123',
      'QQ': '123456789',
      '地址': '北京市朝阳区XX路XX号',
      '网站': 'https://example.com',
      '行业': '互联网',
      '公司规模': '100-500人',
      '客户来源': 'website',
      '客户等级': 'important',
      '客户阶段': 'potential',
      '备注': '重要客户'
    }];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
      { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
      { wch: 15 }, { wch: 15 }, { wch: 35 }, { wch: 25 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, '客户导入模板');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=customer_import_template.xlsx');
    
    res.send(buffer);
  } catch (error) {
    console.error('下载模板错误:', error);
    res.status(500).json({
      code: 500,
      message: '下载失败'
    });
  }
};

/**
 * 从Excel导入客户
 */
exports.importCustomers = async (req, res) => {
  try {
    const XLSX = require('xlsx');

    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传Excel文件'
      });
    }

    // 解析Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Excel文件为空'
      });
    }

    const successList = [];
    const errorList = [];

    // 逐行处理
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 2; // Excel行号（从2开始，因为有表头）

      try {
        // 验证必填字段
        const name = row['客户名称*'] || row['客户名称'];
        const contact = row['联系人*'] || row['联系人'];
        const phone = row['电话*'] || row['电话'];

        if (!name || !contact || !phone) {
          errorList.push({
            row: rowNum,
            data: row,
            error: '缺少必填字段：客户名称、联系人、电话'
          });
          continue;
        }

        // 检查是否已存在
        const existCustomer = await models.Customer.findOne({
          where: { name, phone }
        });

        if (existCustomer) {
          errorList.push({
            row: rowNum,
            data: row,
            error: '客户已存在（公司名称+电话重复）'
          });
          continue;
        }

        // 生成客户编号
        const today = dayjs().format('YYYYMMDD')
        const prefix = `C${today}`
        const latest = await models.Customer.findOne({
          where: { code: { [Op.like]: `${prefix}%` } },
          attributes: ['code'],
          order: [['code', 'DESC']],
          paranoid: false
        })
        let seq = 1
        if (latest && latest.code && latest.code.startsWith(prefix)) {
          const tail = latest.code.slice(-4)
          const num = parseInt(tail, 10)
          if (!isNaN(num)) seq = num + 1
        }
        const code = `${prefix}${String(seq).padStart(4, '0')}`

        // 创建客户
        const customer = await models.Customer.create({
          code,
          name,
          short_name: row['简称'] || '',
          credit_code: row['统一社会信用代码'] || '',
          contact,
          position: row['职位'] || '',
          phone,
          mobile: row['手机'] || '',
          email: row['邮箱'] || '',
          wechat: row['微信'] || '',
          qq: row['QQ'] || '',
          address: row['地址'] || '',
          website: row['网站'] || '',
          industry: row['行业'] || '',
          company_size: row['公司规模'] || '',
          source: row['客户来源'] || 'import',
          level: row['客户等级'] || 'normal',
          stage: row['客户阶段'] || 'potential',
          remark: row['备注'] || '',
          owner_id: req.user.id // 导入的客户归属当前用户
        });

        successList.push({
          row: rowNum,
          name: customer.name
        });
      } catch (error) {
        errorList.push({
          row: rowNum,
          data: row,
          error: error.message
        });
      }
    }

    res.json({
      code: 200,
      message: `导入完成：成功${successList.length}条，失败${errorList.length}条`,
      data: {
        total: jsonData.length,
        successCount: successList.length,
        errorCount: errorList.length,
        successList,
        errorList
      }
    });
  } catch (error) {
    console.error('导入客户错误:', error);
    res.status(500).json({
      code: 500,
      message: '导入失败：' + error.message
    });
  }
};

/**
 * 转移客户（单个）
 */
exports.transferCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { to_user_id, reason, remark } = req.body;

    // 验证参数
    if (!to_user_id) {
      return res.status(400).json({
        code: 400,
        message: '请选择新负责人'
      });
    }

    // 查找客户
    const customer = await models.Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在'
      });
    }

    await ensureUserContext(req)
    // 检查权限（只能转移自己的客户，或者管理员可以转移任何客户）
    if (!isAdmin(req) && customer.owner_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权限转移此客户'
      });
    }

    // 检查是否转移给自己
    if (customer.owner_id === to_user_id) {
      return res.status(400).json({
        code: 400,
        message: '客户已归属该负责人'
      });
    }

    // 验证新负责人是否存在
    const toUser = await models.User.findByPk(to_user_id);
    if (!toUser) {
      return res.status(404).json({
        code: 404,
        message: '新负责人不存在'
      });
    }

    const oldOwnerId = customer.owner_id;

    // 创建转移记录
    await models.CustomerTransfer.create({
      customer_id: id,
      from_user_id: oldOwnerId,
      to_user_id: to_user_id,
      reason: reason || '',
      remark: remark || '',
      transfer_by: req.user.id
    });

    // 更新客户负责人
    await customer.update({
      owner_id: to_user_id
    });

    // 发送通知给新负责人和原负责人
    try {
      const operator = await models.User.findByPk(req.user.id);
      const operatorName = operator?.name || operator?.username || '系统管理员';
      
      // 通知新负责人
      await notificationController.sendCustomerAssignNotification(
        id,
        to_user_id,
        operatorName
      );
      
      // 通知原负责人（如果存在）
      if (oldOwnerId) {
        await models.Notification.create({
          user_id: oldOwnerId,
          type: 'customer',
          title: '客户转移通知',
          content: `您的客户【${customer.name}】已被${operatorName}转移给其他人`,
          link: `/customers/${id}`,
          sender_id: req.user.id,
          extra_data: {
            customer_id: id,
            customer_name: customer.name,
            new_owner_id: to_user_id,
            transfer_reason: reason
          }
        });
      }
      
      console.log(`✅ 客户转移通知已发送：客户ID=${id}, 原负责人=${oldOwnerId}, 新负责人=${to_user_id}`);
    } catch (error) {
      console.error('发送客户转移通知失败:', error);
    }

    // 获取完整的客户信息
    const updatedCustomer = await models.Customer.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'owner',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    res.json({
      code: 200,
      message: '客户转移成功',
      data: updatedCustomer
    });
  } catch (error) {
    console.error('转移客户错误:', error);
    res.status(500).json({
      code: 500,
      message: '转移失败',
      error: error.message
    });
  }
};

/**
 * 批量转移客户
 */
exports.batchTransferCustomers = async (req, res) => {
  try {
    const { customer_ids, to_user_id, reason, remark } = req.body;

    // 验证参数
    if (!customer_ids || !Array.isArray(customer_ids) || customer_ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要转移的客户'
      });
    }

    if (!to_user_id) {
      return res.status(400).json({
        code: 400,
        message: '请选择新负责人'
      });
    }

    // 验证新负责人是否存在
    const toUser = await models.User.findByPk(to_user_id);
    if (!toUser) {
      return res.status(404).json({
        code: 404,
        message: '新负责人不存在'
      });
    }

    // 查找所有要转移的客户
    const customers = await models.Customer.findAll({
      where: {
        id: { [Op.in]: customer_ids }
      }
    });

    if (customers.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '未找到要转移的客户'
      });
    }

    const successList = [];
    const errorList = [];

    // 逐个处理转移
    for (const customer of customers) {
      try {
        // 检查权限
        await ensureUserContext(req)
        if (!isAdmin(req) && customer.owner_id !== req.user.id) {
          errorList.push({
            id: customer.id,
            name: customer.name,
            error: '无权限转移此客户'
          });
          continue;
        }

        // 检查是否转移给自己
        if (customer.owner_id === to_user_id) {
          errorList.push({
            id: customer.id,
            name: customer.name,
            error: '客户已归属该负责人'
          });
          continue;
        }

        const oldOwnerId = customer.owner_id;

        // 创建转移记录
        await models.CustomerTransfer.create({
          customer_id: customer.id,
          from_user_id: oldOwnerId,
          to_user_id: to_user_id,
          reason: reason || '',
          remark: remark || '',
          transfer_by: req.user.id
        });

        // 更新客户负责人
        await customer.update({
          owner_id: to_user_id
        });

        // 发送通知给新负责人和原负责人
        try {
          const operator = await models.User.findByPk(req.user.id);
          const operatorName = operator?.name || operator?.username || '系统管理员';
          
          // 通知新负责人
          await notificationController.sendCustomerAssignNotification(
            customer.id,
            to_user_id,
            operatorName
          );
          
          // 通知原负责人（如果存在）
          if (oldOwnerId) {
            await models.Notification.create({
              user_id: oldOwnerId,
              type: 'customer',
              title: '客户转移通知',
              content: `您的客户【${customer.name}】已被${operatorName}转移给其他人`,
              link: `/customers/${customer.id}`,
              sender_id: req.user.id,
              extra_data: {
                customer_id: customer.id,
                customer_name: customer.name,
                new_owner_id: to_user_id,
                transfer_reason: reason
              }
            });
          }
        } catch (error) {
          console.error(`发送客户转移通知失败(客户ID=${customer.id}):`, error);
        }

        successList.push({
          id: customer.id,
          name: customer.name
        });
      } catch (error) {
        errorList.push({
          id: customer.id,
          name: customer.name,
          error: error.message
        });
      }
    }

    res.json({
      code: 200,
      message: `批量转移完成：成功${successList.length}个，失败${errorList.length}个`,
      data: {
        total: customers.length,
        success: successList.length,
        fail: errorList.length,
        successList,
        errorList
      }
    });
  } catch (error) {
    console.error('批量转移客户错误:', error);
    res.status(500).json({
      code: 500,
      message: '批量转移失败',
      error: error.message
    });
  }
};

/**
 * 获取客户转移历史
 */
exports.getTransferHistory = async (req, res) => {
  try {
    const { customer_id } = req.query;
    const {
      page = 1,
      pageSize = 10
    } = req.query;

    const where = {};
    if (customer_id) {
      where.customer_id = customer_id;
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const { count, rows } = await models.CustomerTransfer.findAndCountAll({
      where,
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'contact', 'phone']
        },
        {
          model: models.User,
          as: 'fromUser',
          attributes: ['id', 'name', 'username']
        },
        {
          model: models.User,
          as: 'toUser',
          attributes: ['id', 'name', 'username']
        },
        {
          model: models.User,
          as: 'operator',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit
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
    console.error('获取转移历史错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取转移历史失败',
      error: error.message
    });
  }
};
