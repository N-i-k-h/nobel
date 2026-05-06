const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protectRoute, adminOnly, getAuditLogs);

module.exports = router;
