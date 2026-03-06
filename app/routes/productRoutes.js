const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const checkEmptySession = require("../middleware/checkEmptySession");
const upload = require("../middleware/upload");

// ===== PRODUCTS =====
router.get(
  "/panel/products-list",
  checkEmptySession,
  productController.productList,
);

router.get(
  "/panel/add-product",
  checkEmptySession,
  productController.addProduct,
);

router.post(
  "/panel/add-product",
  checkEmptySession,
  (req, res, next) => {
    req.uploadFolder = "products";
    next();
  },
  upload.array("product_images", 10),
  productController.saveProduct,
);

router.post(
  "/panel/delete-product",
  checkEmptySession,
  productController.deleteProduct,
);

router.post(
  "/panel/toggle-product-status",
  checkEmptySession,
  productController.toggleProductStatus,
);

router.get(
  "/panel/edit-product/:token",
  checkEmptySession,
  productController.editProduct,
);

router.post(
  "/panel/edit-product/:token",
  checkEmptySession,
  (req, res, next) => {
    req.uploadFolder = "products";
    next();
  },
  upload.array("product_images", 10),
  productController.updateProduct,
);

// ===== API: DYNAMIC CATEGORY DROPDOWNS =====
router.get(
  "/api/sub-categories/:token",
  checkEmptySession,
  productController.getSubCategories,
);

router.get(
  "/api/child-categories/:token",
  checkEmptySession,
  productController.getChildCategories,
);

router.get(
  "/api/grand-child-categories/:token",
  checkEmptySession,
  productController.getGrandChildCategories,
);

//PRODUCT GALLERY
router.get(
  "/panel/product-gallery",
  checkEmptySession,
  productController.productGallery,
);

router.post(
  "/panel/product-gallery/add",
  checkEmptySession,
  (req, res, next) => {
    req.uploadFolder = "gallery";
    next();
  },
  upload.single("image"),
  productController.addGallery,
);

router.post(
  "/panel/product-gallery/edit",
  checkEmptySession,
  (req, res, next) => {
    req.uploadFolder = "gallery";
    next();
  },
  upload.single("image"),
  productController.editGallery,
);

router.post(
  "/panel/product-gallery/toggle-status",
  checkEmptySession,
  productController.toggleStatus,
);

router.post(
  "/panel/product-gallery/delete",
  checkEmptySession,
  productController.deleteGallery,
);

router.post(
  "/panel/product-gallery/upload-chunk",
  checkEmptySession,
  (req, res, next) => {
    req.uploadFolder = "tmp";
    next();
  },
  upload.single("chunk"),
  productController.uploadChunk,
);

module.exports = router;
