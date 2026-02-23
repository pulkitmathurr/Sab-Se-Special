const express = require("express");
const router = express.Router();

const DashboardController = require("../controllers/DashboardController");
const AuthController = require("../controllers/AuthController");
const categoryController = require("../controllers/categoryController");
const checkEmptySession = require("../middleware/checkEmptySession");
const IsAuthenticated = require("../middleware/isAuthenticated");
const upload = require("../middleware/upload");

router.get("/login", IsAuthenticated, AuthController.login);

router.post("/login", IsAuthenticated, AuthController.postLogin);

router.get("/", checkEmptySession, DashboardController.index);

router.get("/profile", checkEmptySession, AuthController.getProfile);
router.post("/profile/update", checkEmptySession, (req, res, next) => { req.uploadFolder = "profile"; next(); }, upload.single("profile_image"), AuthController.postProfile);

module.exports = router;
