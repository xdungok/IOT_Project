const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController');
router.post('/', controlController.sendCommand);
router.get('/states', controlController.getDeviceStates);

module.exports = router;