const express = require('express');
const router = express.Router();
const { createCard, getCards, updateCard, deleteCard } = require('../controllers/cardController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectRoute, getCards)
  .post(protectRoute, adminOnly, createCard);

router.route('/:id')
  .put(protectRoute, adminOnly, updateCard)
  .delete(protectRoute, adminOnly, deleteCard);

module.exports = router;
