const express = require('express');
const router = express.Router();
const { 
  getOperatorReport, 
  getProductionReport, 
  getRejectionReport, 
  getProcessReport, 
  getCardReport, 
  getBagReport 
} = require('../controllers/reportController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.get('/operator', protectRoute, adminOnly, getOperatorReport);
router.get('/production', protectRoute, adminOnly, getProductionReport);
router.get('/rejection', protectRoute, adminOnly, getRejectionReport);
router.get('/process', protectRoute, adminOnly, getProcessReport);
router.get('/card', protectRoute, adminOnly, getCardReport);
router.get('/bag', protectRoute, adminOnly, getBagReport);

module.exports = router;
