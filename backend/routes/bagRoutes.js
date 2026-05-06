const express = require('express');
const router = express.Router();
const { createBag, getBags, updateBag, deleteBag } = require('../controllers/bagController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectRoute, getBags)
  .post(protectRoute, adminOnly, createBag);

router.route('/:id')
  .put(protectRoute, adminOnly, updateBag)
  .delete(protectRoute, adminOnly, deleteBag);

module.exports = router;
