const { models } = require('../models');
const { Op } = require('sequelize');
const { ensureUserContext, isAdmin } = require('../utils/access')

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureUserContext(req)
    
    const where = isAdmin(req) ? {} : { owner_id: userId };
    
    const [customerCount, opportunityCount, followupCount, todayFollowupCount] = await Promise.all([
      models.Customer.count({ where }),
      models.Opportunity.count({ where: { ...where, status: 'open' } }),
      models.Followup.count({ where }),
      models.Followup.count({
        where: {
          ...where,
          next_followup_at: {
            [Op.between]: [new Date().setHours(0,0,0,0), new Date().setHours(23,59,59,999)]
          }
        }
      })
    ]);

    res.json({
      code: 200,
      data: {
        customerCount,
        opportunityCount,
        followupCount,
        todayFollowupCount
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};
