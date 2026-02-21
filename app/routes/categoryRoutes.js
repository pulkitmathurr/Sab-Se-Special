const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/upload");
const checkEmptySession = require("../middleware/checkEmptySession");
const isAuthenticated = require("../middleware/isAuthenticated");
//main categories
router.get("/main-categories",checkEmptySession,categoryController.mainCategories);
router.get("/panel/main-categories", checkEmptySession, categoryController.mainCategories);
//add main category
router.post("/add-main-category",checkEmptySession,upload.single("image"),categoryController.addMainCategory);

//edit main category
router.post("/panel/edit-main-category",checkEmptySession,upload.single("image"),categoryController.editMainCategory);

//delete main category
router.post("/panel/delete-main-category",checkEmptySession,categoryController.deleteMainCategory);

//unpublish main category
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


module.exports = router;