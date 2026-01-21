const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/system', settingsController.getSystemSettings);
router.put('/system', settingsController.updateSystemSettings);
router.get('/user', settingsController.getUserSettings);
router.put('/user', settingsController.updateUserSettings);
router.post('/password', settingsController.changePassword);

module.exports = router;
