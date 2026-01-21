"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 添加客户编号列
    await queryInterface.addColumn('customers', 'code', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: '',
      comment: '客户编号：C+YYYYMMDD+4位流水号'
    });

    // 为现有记录填充占位编号（避免唯一索引失败）
    // 使用自增行号生成临时编号，实际新建时由应用生成正式编号
    try {
      const [results] = await queryInterface.sequelize.query(
        "SELECT id FROM customers WHERE code = '' OR code IS NULL ORDER BY id ASC;"
      );
      let i = 1;
      for (const row of results) {
        const temp = `C00000000${String(i).padStart(4, '0')}`;
        // 忽略错误，尽最大努力填充
        try {
          await queryInterface.sequelize.query(
            `UPDATE customers SET code = :code WHERE id = :id`,
            { replacements: { code: temp, id: row.id } }
          );
        } catch (e) {}
        i++;
      }
    } catch (e) {}

    // 创建唯一索引
    await queryInterface.addIndex('customers', ['code'], {
      unique: true,
      name: 'ux_customers_code'
    });

    // 为手机号和手机增加普通索引（非唯一，避免历史脏数据迁移失败）
    const indexes = await queryInterface.showIndex('customers').catch(() => []);
    const hasPhoneIdx = Array.isArray(indexes) && indexes.some(i => i.name === 'idx_customers_phone');
    if (!hasPhoneIdx) {
      await queryInterface.addIndex('customers', ['phone'], { name: 'idx_customers_phone' });
    }
    const hasMobileIdx = Array.isArray(indexes) && indexes.some(i => i.name === 'idx_customers_mobile');
    if (!hasMobileIdx) {
      await queryInterface.addIndex('customers', ['mobile'], { name: 'idx_customers_mobile' });
    }
  },

  async down(queryInterface) {
    try { await queryInterface.removeIndex('customers', 'ux_customers_code'); } catch (e) {}
    try { await queryInterface.removeIndex('customers', 'idx_customers_phone'); } catch (e) {}
    try { await queryInterface.removeIndex('customers', 'idx_customers_mobile'); } catch (e) {}
    try { await queryInterface.removeColumn('customers', 'code'); } catch (e) {}
  }
};
