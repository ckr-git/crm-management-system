const { models } = require('../models');
const { Op } = require('sequelize');

/**
 * 获取操作日志列表
 */
exports.getOperationLogs = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      user_id = '',
      module = '',
      action = '',
      status = '',
      start_date = '',
      end_date = ''
    } = req.query;

    // 构建查询条件
    const where = {};
    
    if (user_id) {
      where.user_id = user_id;
    }
    if (module) {
      where.module = module;
    }
    if (action) {
      where.action = action;
    }
    if (status) {
      where.status = status;
    }
    
    // 时间范围
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    } else if (start_date) {
      where.created_at = {
        [Op.gte]: new Date(start_date)
      };
    } else if (end_date) {
      where.created_at = {
        [Op.lte]: new Date(end_date)
      };
    }

    // 分页参数
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 查询日志列表
    const { count, rows } = await models.OperationLog.findAndCountAll({
      where,
      include: [{
        model: models.User,
        as: 'user',
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
    console.error('获取操作日志错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取日志详情
 */
exports.getLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await models.OperationLog.findByPk(id, {
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'name', 'username', 'email']
      }]
    });

    if (!log) {
      return res.status(404).json({
        code: 404,
        message: '日志不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: log
    });
  } catch (error) {
    console.error('获取日志详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 导出操作日志
 */
exports.exportLogs = async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const {
      user_id = '',
      module = '',
      action = '',
      status = '',
      start_date = '',
      end_date = ''
    } = req.query;

    // 构建查询条件
    const where = {};
    if (user_id) where.user_id = user_id;
    if (module) where.module = module;
    if (action) where.action = action;
    if (status) where.status = status;
    
    if (start_date && end_date) {
      where.created_at = { [Op.between]: [new Date(start_date), new Date(end_date)] };
    }

    // 查询所有符合条件的日志
    const logs = await models.OperationLog.findAll({
      where,
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['name']
      }],
      order: [['created_at', 'DESC']],
      limit: 10000 // 限制导出数量
    });

    // 准备Excel数据
    const excelData = logs.map(log => ({
      '操作时间': log.created_at,
      '操作人': log.user?.name || '',
      '模块': log.module,
      '操作': log.action,
      '描述': log.description || '',
      'IP地址': log.ip || '',
      '状态': log.status === 'success' ? '成功' : '失败',
      '错误信息': log.error_message || ''
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 30 }, { wch: 18 }, { wch: 10 }, { wch: 40 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, '操作日志');

    // 生成Buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=operation_logs_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    console.error('导出日志错误:', error);
    res.status(500).json({
      code: 500,
      message: '导出失败',
      error: error.message
    });
  }
};
