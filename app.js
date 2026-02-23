const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const session = require("express-session");
const flashMiddleware = require("./app/middleware/flashMiddleware");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const multer = require("multer");
const { userData } = require("./app/middleware/middleware");


const PORT = 2200;

// Routes
const router = require("./app/routes/router");
const categoryRoutes = require("./app/routes/categoryRoutes");
const productRoutes = require("./app/routes/productRoutes");
// Basic settings
app.set("trust proxy", 1);
// Logger
app.use(morgan("dev"));
// Session
app.use(
  session({
    secret:
      "e3f5a1d8c7b2e490f3435dsde4b7fdsf43324c9f2afdsfdsf5d8e6f3b4a9c1d7e8f2b6c3d4a7e9f1",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 100 * 60 * 60 * 1000,
      secure: false,
    },
  }),
);

// Middlewares
app.use(cors());
app.use(flashMiddleware);

// Global EJS helpers
app.use((req, res, next) => {
  res.locals.success_msg = res.getFlash("success");
  res.locals.error_msg = res.getFlash("error");

  res.locals.capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  res.locals.formatInr = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  res.locals.capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  next();
});

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// Static files
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));  // ADD THIS LINE
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// EJS setup
app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

app.use(userData);
// Main routes
app.use("/", router);
// Category routes
app.use("/", categoryRoutes);
// Product routes
app.use("/", productRoutes);

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to destroy session");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

// 404 handler (optional)
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
