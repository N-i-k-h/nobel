const express = require('express');
const router = express.Router();
const { createWorkLog, getWorkLogs, updateWorkLog } = require('../controllers/worklogController');
const { protectRoute } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectRoute, getWorkLogs)
  .post(protectRoute, createWorkLog);

router.route('/:id')
  .put(protectRoute, updateWorkLog);

module.exports = router;
