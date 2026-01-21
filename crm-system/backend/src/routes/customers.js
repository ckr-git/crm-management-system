const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const upload = require('../middleware/upload');
const validate = require('../middlewares/validate');
const {
  createCustomerValidation,
  updateCustomerValidation,
  customerIdValidation,
  transferCustomerValidation,
  batchOperationValidation,
  getCustomersValidation
} = require('../validations/customerValidation');

/**
 * 客户管理路由
 */

/**
 * @route   GET /api/customers/export
 * @desc    导出客户到Excel
 * @access  Private
 */
router.get('/export', customerController.exportCustomers);

/**
 * @route   GET /api/customers/template
 * @desc    下载导入模板
 * @access  Private
 */
router.get('/template', customerController.downloadTemplate);

/**
 * @route   POST /api/customers/import
 * @desc    从Excel导入客户
 * @access  Private
 */
router.post('/import', upload.single('file'), customerController.importCustomers);

/**
 * @route   POST /api/customers/batch-delete
 * @desc    批量删除客户
 * @access  Private
 */
router.post('/batch-delete', batchOperationValidation, validate, customerController.batchDeleteCustomers);

/**
 * @route   GET /api/customers/transfer-history
 * @desc    获取客户转移历史
 * @access  Private
 */
router.get('/transfer-history', customerController.getTransferHistory);

/**
 * @route   POST /api/customers/:id/transfer
 * @desc    转移客户
 * @access  Private
 */
router.post('/:id/transfer', transferCustomerValidation, validate, customerController.transferCustomer);

/**
 * @route   POST /api/customers/batch-transfer
 * @desc    批量转移客户
 * @access  Private
 */
router.post('/batch-transfer', batchOperationValidation, validate, customerController.batchTransferCustomers);

/**
 * @route   GET /api/customers
 * @desc    获取客户列表（带分页和搜索）
 * @access  Private
 */
router.get('/', getCustomersValidation, validate, customerController.getCustomers);

/**
 * @route   POST /api/customers
 * @desc    创建客户
 * @access  Private
 */
router.post('/', createCustomerValidation, validate, customerController.createCustomer);

/**
 * @route   GET /api/customers/:id
 * @desc    获取客户详情
 * @access  Private
 */
router.get('/:id', customerIdValidation, validate, customerController.getCustomerById);

/**
 * @route   PUT /api/customers/:id
 * @desc    更新客户
 * @access  Private
 */
router.put('/:id', updateCustomerValidation, validate, customerController.updateCustomer);

/**
 * @route   DELETE /api/customers/:id
 * @desc    删除客户
 * @access  Private
 */
router.delete('/:id', customerIdValidation, validate, customerController.deleteCustomer);

module.exports = router;
