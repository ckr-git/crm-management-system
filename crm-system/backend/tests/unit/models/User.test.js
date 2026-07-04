const { createTestDatabase, syncTestDatabase, cleanTestDatabase, models } = require('../../helpers/testDatabase');
const bcrypt = require('bcryptjs');

describe('User Model - 用户模型单元测试', () => {
  let sequelize;
  let UserModel;
  let testUser;

  beforeAll(async () => {
    sequelize = createTestDatabase();
    UserModel = models.User;
    await syncTestDatabase(sequelize);
    await models.Role.create({ id: 1, name: '销售', code: 'sales' });
  });

  afterAll(async () => {
    await cleanTestDatabase(sequelize);
  });

  describe('创建用户', () => {
    test('应该成功创建用户', async () => {
      const user = await UserModel.create({
        username: 'testuser',
        password: 'password123',
        name: '测试用户',
        email: 'test@example.com',
        role_id: 1,
        status: 1
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.name).toBe('测试用户');
    });

    test('密码应该被自动加密', async () => {
      const plainPassword = 'password123';
      const user = await UserModel.create({
        username: 'encrypttest',
        password: plainPassword,
        name: '加密测试',
        role_id: 1,
        status: 1
      });

      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(plainPassword.length);

      // 验证是bcrypt加密
      const isValidPassword = bcrypt.compareSync(plainPassword, user.password);
      expect(isValidPassword).toBe(true);
    });

    test('应该拒绝重复的用户名', async () => {
      await UserModel.create({
        username: 'duplicate',
        password: 'test123',
        name: '重复测试1',
        role_id: 1
      });

      await expect(
        UserModel.create({
          username: 'duplicate',
          password: 'test456',
          name: '重复测试2',
          role_id: 1
        })
      ).rejects.toThrow();
    });

    test('应该设置默认状态为1（启用）', async () => {
      const user = await UserModel.create({
        username: 'defaultstatus',
        password: 'test123',
        name: '默认状态测试',
        role_id: 1
      });

      expect(user.status).toBe(1);
    });

    test('应该设置默认登录次数为0', async () => {
      const user = await UserModel.create({
        username: 'logincount',
        password: 'test123',
        name: '登录次数测试',
        role_id: 1
      });

      expect(user.login_count).toBe(0);
    });
  });

  describe('实例方法', () => {
    let methodUserCounter = 0;

    beforeEach(async () => {
      methodUserCounter += 1;
      testUser = await UserModel.create({
        username: `methodtest_${methodUserCounter}`,
        password: 'password123',
        name: '方法测试',
        email: 'method@example.com',
        role_id: 1
      });
    });

    test('validatePassword() 应该验证正确的密码', () => {
      const isValid = testUser.validatePassword('password123');
      expect(isValid).toBe(true);
    });

    test('validatePassword() 应该拒绝错误的密码', () => {
      const isValid = testUser.validatePassword('wrongpassword');
      expect(isValid).toBe(false);
    });

    test('toSafeJSON() 应该隐藏敏感字段', () => {
      const safeData = testUser.toSafeJSON();

      expect(safeData).not.toHaveProperty('password');
      expect(safeData).not.toHaveProperty('deleted_at');
      expect(safeData).toHaveProperty('username');
      expect(safeData).toHaveProperty('name');
      expect(safeData).toHaveProperty('email');
    });
  });

  describe('更新用户', () => {
    test('应该成功更新用户信息', async () => {
      const user = await UserModel.create({
        username: 'updatetest',
        password: 'test123',
        name: '更新测试',
        role_id: 1
      });

      await user.update({
        name: '已更新',
        email: 'updated@example.com'
      });

      expect(user.name).toBe('已更新');
      expect(user.email).toBe('updated@example.com');
    });

    test('更新密码时应该重新加密', async () => {
      const user = await UserModel.create({
        username: 'passwordupdate',
        password: 'oldpassword',
        name: '密码更新测试',
        role_id: 1
      });

      const oldPasswordHash = user.password;

      await user.update({
        password: 'newpassword'
      });

      expect(user.password).not.toBe(oldPasswordHash);
      expect(user.validatePassword('newpassword')).toBe(true);
      expect(user.validatePassword('oldpassword')).toBe(false);
    });
  });

  describe('软删除', () => {
    test('应该支持软删除', async () => {
      const user = await UserModel.create({
        username: 'softdelete',
        password: 'test123',
        name: '软删除测试',
        role_id: 1
      });

      const userId = user.id;

      await user.destroy();

      // 正常查询应该找不到
      const found = await UserModel.findByPk(userId);
      expect(found).toBeNull();

      // 包含软删除的查询应该能找到
      const foundWithDeleted = await UserModel.findByPk(userId, {
        paranoid: false
      });
      expect(foundWithDeleted).toBeDefined();
      expect(foundWithDeleted.deleted_at).not.toBeNull();
    });
  });

  describe('时间戳', () => {
    test('创建时应该自动设置created_at和updated_at', async () => {
      const user = await UserModel.create({
        username: 'timestamp',
        password: 'test123',
        name: '时间戳测试',
        role_id: 1
      });

      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
    });

    test('更新时应该自动更新updated_at', async () => {
      const user = await UserModel.create({
        username: 'timestampupdate',
        password: 'test123',
        name: '时间戳更新测试',
        role_id: 1
      });

      const originalUpdatedAt = user.updated_at;

      // 等待1ms确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));

      await user.update({ name: '已更新' });

      expect(user.updated_at).toBeInstanceOf(Date);
      expect(user.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
