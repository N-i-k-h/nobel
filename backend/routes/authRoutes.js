const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUsers, deleteUser, updateUser } = require('../controllers/authController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', protectRoute, adminOnly, registerUser);
router.post('/login', authUser);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);

module.exports = router;
