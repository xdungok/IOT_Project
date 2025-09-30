const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
router.get('/sensors', historyController.getSensorHistory);
router.get('/activity', historyController.getActivityHistory);

module.exports = router;