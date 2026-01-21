const { models, sequelize } = require('../models');

exports.getSystemSettings = async (req, res) => {
  try {
    const configs = await models.SystemConfig.findAll();
    const settings = {};
    configs.forEach(config => {
      let value = config.config_value;
      if (config.config_type === 'json') {
        value = JSON.parse(value);
      } else if (config.config_type === 'boolean') {
        value = value === 'true';
      } else if (config.config_type === 'number') {
        value = Number(value);
      }
      settings[config.config_key] = value;
    });
    res.json({ code: 200, data: settings });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      let configValue = value;
      let configType = 'string';
      
      if (typeof value === 'object') {
        configValue = JSON.stringify(value);
        configType = 'json';
      } else if (typeof value === 'boolean') {
        configValue = String(value);
        configType = 'boolean';
      } else if (typeof value === 'number') {
        configValue = String(value);
        configType = 'number';
      }

      await models.SystemConfig.upsert({
        config_key: key,
        config_value: configValue,
        config_type: configType
      });
    }
    res.json({ code: 200, message: '保存成功' });
  } catch (error) {
    console.error('更新系统设置失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

exports.getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await models.User.findByPk(userId, {
      attributes: ['id', 'username', 'name', 'email', 'phone', 'avatar']
    });
    res.json({ code: 200, data: user });
  } catch (error) {
    console.error('获取用户设置失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

exports.updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, avatar } = req.body;
    await models.User.update(
      { name, email, phone, avatar },
      { where: { id: userId } }
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    console.error('更新用户设置失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;
    const user = await models.User.findByPk(userId);
    
    console.log('修改密码请求 - 用户ID:', userId);
    console.log('原密码:', old_password);
    console.log('新密码:', new_password);
    console.log('数据库密码:', user.password);
    
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(old_password, user.password);
    console.log('密码验证结果:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ code: 400, message: '原密码错误' });
    }
    
    const hashedPassword = await bcrypt.hash(new_password, 10);
    console.log('新密码哈希:', hashedPassword);
    
    await sequelize.query(
      'UPDATE users SET password = ? WHERE id = ?',
      { replacements: [hashedPassword, userId] }
    );
    
    console.log('✅ 密码已更新');
    res.json({ code: 200, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};
