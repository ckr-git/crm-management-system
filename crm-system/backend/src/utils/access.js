const { models } = require('../models')

async function ensureUserContext(req) {
  if (req.user && !req.user.__contextLoaded) {
    const user = await models.User.findByPk(req.user.id, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['id', 'name', 'code', 'is_system'],
        include: [{
          model: models.Permission,
          as: 'permissions',
          attributes: ['code']
        }]
      }],
      attributes: ['id']
    })
    if (user) {
      req.user.role_id = user.role?.id
      req.user.role = user.role?.code || req.user.role
      req.user.is_system = user.role?.is_system || 0
      req.user.permissions = user.role?.permissions?.map(p => p.code) || []
    }
    req.user.__contextLoaded = true
  }
}

function isAdmin(req) {
  const roleCode = req.user?.role
  const isSystem = req.user?.is_system
  return roleCode === 'admin' || isSystem === 1
}

function hasPermission(req, code) {
  const list = req.user?.permissions || []
  return list.includes(code) || isAdmin(req)
}

module.exports = {
  ensureUserContext,
  isAdmin,
  hasPermission,
}