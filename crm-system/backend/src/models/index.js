const { Sequelize } = require('sequelize');
const config = require('../config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config.database[env];

// 创建Sequelize实例
let sequelize;
if (dbConfig.dialect === 'sqlite') {
  // SQLite配置（用于测试）
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbConfig.storage,
    logging: dbConfig.logging,
    define: dbConfig.define
  });
} else {
  // MySQL配置
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      timezone: dbConfig.timezone,
      define: dbConfig.define,
      pool: dbConfig.pool
    }
  );
}

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ MySQL数据库连接失败:', error.message);
    return false;
  }
};

// 导入模型
const User = require('./User')(sequelize);
const Role = require('./Role')(sequelize);
const Permission = require('./Permission')(sequelize);
const RolePermission = require('./RolePermission')(sequelize);
const Customer = require('./Customer')(sequelize);
const Followup = require('./Followup')(sequelize);
const CustomerPool = require('./CustomerPool')(sequelize);
const Opportunity = require('./Opportunity')(sequelize);
const CustomerTransfer = require('./CustomerTransfer')(sequelize);
const OperationLog = require('./OperationLog')(sequelize);
const Notification = require('./Notification')(sequelize);
const Workflow = require('./Workflow')(sequelize);
const WorkflowInstance = require('./WorkflowInstance')(sequelize);
const WorkflowTask = require('./WorkflowTask')(sequelize);
const SystemConfig = require('./SystemConfig')(sequelize);

// 定义关联关系
const setupAssociations = () => {
  // User belongsTo Role
  User.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role'
  });
  
  // Role hasMany User
  Role.hasMany(User, {
    foreignKey: 'role_id',
    as: 'users'
  });
  
  // Customer belongsTo User (owner)
  Customer.belongsTo(User, {
    foreignKey: 'owner_id',
    as: 'owner'
  });
  
  // User hasMany Customer
  User.hasMany(Customer, {
    foreignKey: 'owner_id',
    as: 'customers'
  });
  
  // Followup belongsTo Customer
  Followup.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'customer'
  });
  
  // Customer hasMany Followup
  Customer.hasMany(Followup, {
    foreignKey: 'customer_id',
    as: 'followups'
  });
  
  // Followup belongsTo User
  Followup.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  
  // User hasMany Followup
  User.hasMany(Followup, {
    foreignKey: 'user_id',
    as: 'followups'
  });
  
  // CustomerPool belongsTo Customer
  CustomerPool.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'customer'
  });
  
  // Customer hasMany CustomerPool
  Customer.hasMany(CustomerPool, {
    foreignKey: 'customer_id',
    as: 'poolRecords'
  });
  
  // CustomerPool belongsTo User (previous owner)
  CustomerPool.belongsTo(User, {
    foreignKey: 'previous_owner_id',
    as: 'previousOwner'
  });
  
  // CustomerPool belongsTo User (claimer)
  CustomerPool.belongsTo(User, {
    foreignKey: 'claimed_by',
    as: 'claimer'
  });
  
  // Opportunity belongsTo Customer
  Opportunity.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'customer'
  });
  
  // Customer hasMany Opportunity
  Customer.hasMany(Opportunity, {
    foreignKey: 'customer_id',
    as: 'opportunities'
  });
  
  // Opportunity belongsTo User (owner)
  Opportunity.belongsTo(User, {
    foreignKey: 'owner_id',
    as: 'owner'
  });
  
  // User hasMany Opportunity
  User.hasMany(Opportunity, {
    foreignKey: 'owner_id',
    as: 'opportunities'
  });
  
  // CustomerTransfer belongsTo Customer
  CustomerTransfer.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'customer'
  });
  
  // Customer hasMany CustomerTransfer
  Customer.hasMany(CustomerTransfer, {
    foreignKey: 'customer_id',
    as: 'transfers'
  });
  
  // CustomerTransfer belongsTo User (from_user)
  CustomerTransfer.belongsTo(User, {
    foreignKey: 'from_user_id',
    as: 'fromUser'
  });
  
  // CustomerTransfer belongsTo User (to_user)
  CustomerTransfer.belongsTo(User, {
    foreignKey: 'to_user_id',
    as: 'toUser'
  });
  
  // CustomerTransfer belongsTo User (transfer_by)
  CustomerTransfer.belongsTo(User, {
    foreignKey: 'transfer_by',
    as: 'operator'
  });
  
  // OperationLog belongsTo User
  OperationLog.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  
  // User hasMany OperationLog
  User.hasMany(OperationLog, {
    foreignKey: 'user_id',
    as: 'logs'
  });

  // Role belongsToMany Permission (多对多)
  Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    as: 'permissions'
  });

  Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: 'permission_id',
    otherKey: 'role_id',
    as: 'roles'
  });

  // Notification belongsTo User (receiver)
  Notification.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'receiver'
  });

  // Notification belongsTo User (sender)
  Notification.belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender'
  });

  // User hasMany Notification (as receiver)
  User.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'received_notifications'
  });

  // User hasMany Notification (as sender)
  User.hasMany(Notification, {
    foreignKey: 'sender_id',
    as: 'sent_notifications'
  });

  // Workflow hasMany WorkflowInstance
  Workflow.hasMany(WorkflowInstance, {
    foreignKey: 'workflow_id',
    as: 'instances'
  });

  // WorkflowInstance belongsTo Workflow
  WorkflowInstance.belongsTo(Workflow, {
    foreignKey: 'workflow_id',
    as: 'workflow'
  });

  // WorkflowInstance belongsTo User (initiator)
  WorkflowInstance.belongsTo(User, {
    foreignKey: 'initiator_id',
    as: 'initiator'
  });

  // WorkflowInstance hasMany WorkflowTask
  WorkflowInstance.hasMany(WorkflowTask, {
    foreignKey: 'instance_id',
    as: 'tasks'
  });

  // WorkflowTask belongsTo WorkflowInstance
  WorkflowTask.belongsTo(WorkflowInstance, {
    foreignKey: 'instance_id',
    as: 'instance'
  });

  // WorkflowTask belongsTo User (assignee)
  WorkflowTask.belongsTo(User, {
    foreignKey: 'assignee_id',
    as: 'assignee'
  });
};

setupAssociations();

module.exports = {
  sequelize,
  testConnection,
  models: {
    User,
    Role,
    Permission,
    RolePermission,
    Customer,
    Followup,
    CustomerPool,
    Opportunity,
    CustomerTransfer,
    OperationLog,
    Notification,
    Workflow,
    WorkflowInstance,
    WorkflowTask,
    SystemConfig
  }
};
