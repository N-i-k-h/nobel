const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectRoute, getProducts)
  .post(protectRoute, adminOnly, createProduct);

router.route('/:id')
  .put(protectRoute, adminOnly, updateProduct)
  .delete(protectRoute, adminOnly, deleteProduct);

module.exports = router;
