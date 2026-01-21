const { models } = require('../models');
require('dotenv').config();

/**
 * 创建跟进记录测试数据
 */
async function seedFollowups() {
  try {
    console.log('开始创建跟进记录测试数据...');

    // 获取客户列表
    const customers = await models.Customer.findAll({
      limit: 5
    });

    if (customers.length === 0) {
      console.log('❌ 没有找到客户数据，请先创建客户');
      return;
    }

    console.log(`找到 ${customers.length} 个客户`);

    // 跟进记录模板
    const followupTemplates = [
      {
        type: 'phone',
        content: '与客户进行了电话沟通，详细了解了客户的需求。客户对我们的产品表示出浓厚兴趣，特别是对产品的稳定性和安全性给予了高度评价。',
        result: '客户意向积极',
        next_plan: '准备产品演示PPT，安排下周三上午的产品演示会议',
        days_offset: -5
      },
      {
        type: 'visit',
        content: '到客户公司进行了实地拜访，与技术负责人和采购经理进行了深入交流。详细介绍了我们的解决方案，客户对技术架构表示认可。',
        result: '客户要求提供详细报价',
        next_plan: '整理详细报价方案，包含部署方案和培训计划',
        days_offset: -3
      },
      {
        type: 'wechat',
        content: '通过微信发送了产品资料和成功案例。客户反馈表示需要时间内部讨论，预计本周五给出初步反馈。',
        result: '等待客户反馈',
        next_plan: '周五下午电话跟进，了解讨论结果',
        days_offset: -1
      },
      {
        type: 'email',
        content: '发送正式报价邮件，包含详细的产品功能清单、价格明细、实施计划和售后服务条款。邮件中附上了3个行业典型案例供参考。',
        result: '客户已读邮件',
        next_plan: '三天后电话跟进，解答客户可能的疑问',
        days_offset: 0
      },
      {
        type: 'visit',
        content: '参加客户组织的产品评审会议，现场演示产品功能。会议上技术团队提出了几个定制需求，我们表示可以满足。',
        result: '客户基本认可方案',
        next_plan: '一周内提供定制需求的技术方案和报价',
        days_offset: 2
      }
    ];

    let createdCount = 0;

    // 为每个客户创建跟进记录
    for (const customer of customers) {
      // 随机选择2-3条跟进记录
      const count = Math.floor(Math.random() * 2) + 2;
      const selectedTemplates = followupTemplates
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      for (const template of selectedTemplates) {
        // 计算跟进时间
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() + template.days_offset);

        // 计算下次跟进时间
        const nextFollowupAt = new Date(createdAt);
        nextFollowupAt.setDate(nextFollowupAt.getDate() + Math.floor(Math.random() * 5) + 3);

        await models.Followup.create({
          customer_id: customer.id,
          user_id: 1, // admin用户
          type: template.type,
          content: template.content,
          result: template.result,
          next_plan: template.next_plan,
          next_followup_at: nextFollowupAt,
          created_at: createdAt,
          updated_at: createdAt
        });

        createdCount++;
        console.log(`✅ 为客户"${customer.name}"创建跟进记录: ${template.type}`);
      }
    }

    console.log('');
    console.log(`✅ 跟进记录测试数据创建完成！`);
    console.log(`共创建 ${createdCount} 条跟进记录`);
    
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
  } finally {
    process.exit(0);
  }
}

seedFollowups();
