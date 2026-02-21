const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

// Product routes
router.get('/panel/products-list', productController.productList);
router.get('/panel/add-product', productController.addProduct);
router.get('/panel/product-gallery', productController.productGallery);

module.exports = router;
