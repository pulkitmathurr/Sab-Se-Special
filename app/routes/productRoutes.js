const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const checkEmptySession = require('../middleware/checkEmptySession');
const upload = require('../middleware/upload');

router.get('/panel/products-list', checkEmptySession, productController.productList);
router.get('/panel/add-product', checkEmptySession, productController.addProduct);

// Product Gallery
router.get('/panel/product-gallery', checkEmptySession, productController.productGallery);
router.post('/panel/product-gallery/add', checkEmptySession, (req, res, next) => { req.uploadFolder = 'gallery'; next(); }, upload.single('image'), productController.addGallery);
router.post('/panel/product-gallery/edit', checkEmptySession, (req, res, next) => { req.uploadFolder = 'gallery'; next(); }, upload.single('image'), productController.editGallery);
router.post('/panel/product-gallery/toggle-status', checkEmptySession, productController.toggleStatus);
router.post('/panel/product-gallery/delete', checkEmptySession, productController.deleteGallery);

module.exports = router;