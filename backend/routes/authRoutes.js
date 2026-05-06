const express = require('express');
const router = express.Router();
const { registerUser, authUser } = require('../controllers/authController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', protectRoute, adminOnly, registerUser);
router.post('/login', authUser);

module.exports = router;
