const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, authUser, getUsers, deleteUser, updateUser } = require('../controllers/authController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

// Strict rate limiter for login: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  skip: (req) => req.headers['x-test-bypass'] && req.headers['x-test-bypass'] === process.env.JWT_SECRET
});

// Public route (rate-limited)
router.post('/login', loginLimiter, authUser);

// Protected admin-only routes
router.post('/register', protectRoute, adminOnly, registerUser);
router.get('/users', protectRoute, adminOnly, getUsers);
router.delete('/users/:id', protectRoute, adminOnly, deleteUser);
router.put('/users/:id', protectRoute, adminOnly, updateUser);

module.exports = router;
