const productModel = require("../models/productModel");
const customFunction = require("../middleware/customFunction");

const productController = {
  // Product List Page
  productList: (req, res) => {
    try {
      // res.render('panel/index', { title: 'Dashboard' });
      res.render("panel/productManagement/products-list",{title: "Product List"});
    } catch (error) {
      console.error("Error in productList:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Add Product Page
  addProduct: (req, res) => {
    try {
      res.render("panel/productManagement/add-products",{title: "Add Product"});
    } catch (error) {
      console.error("Error in addProduct:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Product Gallery Page
  productGallery: (req, res) => {
    try {
      res.render("panel/productManagement/products-gallery",{title: "Product Gallery"});
    } catch (error) {
      console.error("Error in productGallery:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = productController;
