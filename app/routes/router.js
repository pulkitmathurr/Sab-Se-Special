const express = require("express");
const router = express.Router();

// Controllers
const DashboardController = require("../controllers/DashboardController");
const AuthController = require("../controllers/AuthController");
const categoryController = require("../controllers/categoryController");

// Middlewares
const checkEmptySession = require("../middleware/checkEmptySession");
const IsAuthenticated = require("../middleware/isAuthenticated");

// Login page
router.get("/login", IsAuthenticated, AuthController.login);

// Login form submit
router.post("/login", IsAuthenticated, AuthController.postLogin);

// Dashboard home
router.get("/", checkEmptySession, DashboardController.index);

module.exports = router;
