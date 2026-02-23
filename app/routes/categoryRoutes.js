const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/upload");
const checkEmptySession = require("../middleware/checkEmptySession");
const isAuthenticated = require("../middleware/isAuthenticated");
//main categories
router.get("/main-categories",checkEmptySession,categoryController.mainCategories);
router.get("/panel/main-categories", checkEmptySession, categoryController.mainCategories);

router.post("/add-main-category",checkEmptySession,upload.single("image"),categoryController.addMainCategory);

router.post("/panel/edit-main-category",checkEmptySession,upload.single("image"),categoryController.editMainCategory);

router.post("/panel/delete-main-category",checkEmptySession,categoryController.deleteMainCategory);

router.post("/panel/unpublish-main-category",checkEmptySession,categoryController.unpublishMainCategory);


// SUB CATEGORIES FUNCTIONALITY
router.get("/panel/sub-categories", checkEmptySession, categoryController.subCategories);

router.post("/panel/add-sub-category", checkEmptySession, (req, res, next) => {
    req.uploadFolder = 'subcategories';
    next();
}, upload.single("image"), categoryController.addSubCategory);

router.post("/panel/edit-sub-category", checkEmptySession, (req, res, next) => {
    req.uploadFolder = 'subcategories';
    next();
}, upload.single("image"), categoryController.editSubCategory);

router.post("/panel/delete-sub-category",checkEmptySession,categoryController.deleteSubCategory);

router.post("/panel/unpublish-sub-category",checkEmptySession,categoryController.unpublishSubCategory);

//child categories
router.get("/panel/child-categories",checkEmptySession,categoryController.childCategories);

router.post("/panel/delete-child-category",checkEmptySession,categoryController.deleteChildCategory);

router.post("/panel/unpublish-child-category",checkEmptySession,categoryController.unpublishChildCategory);

router.post("/panel/edit-child-category", checkEmptySession, (req, res, next) => {
    req.uploadFolder = 'childcategories';
    next();
}, upload.single("image"), categoryController.editChildCategory);

router.post("/panel/add-child-category", checkEmptySession, (req, res, next) => {
    req.uploadFolder = 'childcategories';
    next();
}, upload.single("image"), categoryController.addChildCategory);

// Grand Child Categories
router.get("/panel/grand-child-categories", checkEmptySession, categoryController.grandChildCategories);

router.post("/panel/add-grand-child-category", checkEmptySession, (req, res, next) => {
    req.uploadFolder = 'grandchildcategories';
    next();
}, upload.single("image"), categoryController.addGrandChildCategory);

router.post("/panel/edit-grand-child-category", checkEmptySession, (req, res, next) => {
    req.uploadFolder = 'grandchildcategories';
    next();
}, upload.single("image"), categoryController.editGrandChildCategory);

router.post("/panel/delete-grand-child-category", checkEmptySession, categoryController.deleteGrandChildCategory);

router.post("/panel/unpublish-grand-child-category", checkEmptySession, categoryController.unpublishGrandChildCategory);



module.exports = router;