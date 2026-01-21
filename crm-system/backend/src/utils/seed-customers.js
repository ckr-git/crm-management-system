const { models } = require('../models');
require('dotenv').config();

/**
 * 创建测试客户数据
 */
async function seedCustomers() {
  try {
    console.log('开始创建测试客户数据...');

    const testCustomers = [
      {
        name: '腾讯科技有限公司',
        short_name: '腾讯',
        contact: '张三',
        position: '采购经理',
        phone: '13800138001',
        mobile: '13800138001',
        email: 'zhangsan@tencent.com',
        wechat: 'zhangsan_wx',
        address: '深圳市南山区科技园',
        website: 'https://www.tencent.com',
        industry: 'IT互联网',
        company_size: '500人以上',
        source: '网站咨询',
        level: 'vip',
        stage: 'negotiation',
        remark: '腾讯公司，重点客户',
        owner_id: 1
      },
      {
        name: '阿里巴巴集团',
        short_name: '阿里',
        contact: '李四',
        position: '总监',
        phone: '13800138002',
        mobile: '13800138002',
        email: 'lisi@alibaba.com',
        address: '杭州市余杭区阿里巴巴西溪园区',
        website: 'https://www.alibaba.com',
        industry: 'IT互联网',
        company_size: '500人以上',
        source: '电话咨询',
        level: 'important',
        stage: 'deal',
        remark: '阿里集团，已成交',
        owner_id: 1
      },
      {
        name: '字节跳动科技',
        short_name: '字节',
        contact: '王五',
        position: '经理',
        phone: '13800138003',
        mobile: '13800138003',
        email: 'wangwu@bytedance.com',
        address: '北京市海淀区中关村',
        website: 'https://www.bytedance.com',
        industry: 'IT互联网',
        company_size: '500人以上',
        source: '展会活动',
        level: 'normal',
        stage: 'intention',
        remark: '字节跳动，意向客户',
        owner_id: 1
      },
      {
        name: '华为技术有限公司',
        short_name: '华为',
        contact: '赵六',
        position: '项目经理',
        phone: '13800138004',
        mobile: '13800138004',
        email: 'zhaoliu@huawei.com',
        address: '深圳市龙岗区华为基地',
        website: 'https://www.huawei.com',
        industry: 'IT互联网',
        company_size: '500人以上',
        source: '老客户转介绍',
        level: 'vip',
        stage: 'quotation',
        remark: '华为公司，正在报价',
        owner_id: 1
      },
      {
        name: '小米科技有限公司',
        short_name: '小米',
        contact: '孙七',
        position: '采购主管',
        phone: '13800138005',
        mobile: '13800138005',
        email: 'sunqi@xiaomi.com',
        address: '北京市海淀区小米科技园',
        website: 'https://www.mi.com',
        industry: 'IT互联网',
        company_size: '500人以上',
        source: '广告投放',
        level: 'important',
        stage: 'potential',
        remark: '小米公司，潜在客户',
        owner_id: 1
      }
    ];

    // 批量创建客户
    for (const customer of testCustomers) {
      // 检查是否已存在
      const existing = await models.Customer.findOne({
        where: { phone: customer.phone }
      });

      if (existing) {
        console.log(`客户 "${customer.name}" 已存在，跳过`);
        continue;
      }

      await models.Customer.create(customer);
      console.log(`✅ 创建客户: ${customer.name}`);
    }

    console.log('');
    console.log('✅ 测试数据创建完成！');
    console.log(`共创建 ${testCustomers.length} 个测试客户`);
    
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
  } finally {
    process.exit(0);
  }
}

seedCustomers();
