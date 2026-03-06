const fs = require("fs");
const path = require("path");
const customFunction = require("../middleware/customFunction");
const {
  insertGallery,
  getAllGallery,
  countGallery,
  updateGallery,
  toggleGalleryStatus,
  deleteGallery,
} = require("../models/productGalleryModel");
const { getMainCategories } = require("../models/categoryModel");
const {
  getSubCategoriesByMainCategory,
  getChildCategoriesBySubCategory,
  getGrandChildCategoriesByChildCategory,
  insertProduct,
  getAllProducts,
  countProducts,
  softDeleteProduct,
  toggleProductStatus: dbToggleStatus,
  getProductByToken,
  updateProduct: dbUpdateProduct,
} = require("../models/productModel");

const productController = {
  // ADD PRODUCT PAGE
  addProduct: async (req, res) => {
    try {
      const mainCategories = await getMainCategories();
      res.render("panel/productManagement/add-products", {
        title: "Add Product",
        mainCategories,
      });
    } catch (error) {
      console.error("Error in addProduct GET:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  // SAVE PRODUCT
  saveProduct: async (req, res) => {
    try {
      const admin_token = req.session.user.token;
      const {
        category_token,
        sub_category_token,
        child_category_token,
        grand_child_category_token,
        product_name,
        description,
        instructions,
        delivery_info,
        pincodes,
        variations,
        prices,
        product_type,
      } = req.body;

      if (!category_token || !product_name) {
        req.setFlash("error", "Please fill all required fields.");
        return res.redirect("/panel/add-product");
      }

      const product_token = customFunction.generateToken(16);
      const slug = customFunction.generateSlug(product_name);
      const files = req.files || [];
      let imagesObject = null;
      if (files.length > 0) {
        imagesObject = {
          primary: files[0].filename,
          gallery: files.map((f) => f.filename),
        };
      }

      let pincodesArray = [];
      if (pincodes) {
        pincodesArray = pincodes
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);

        const invalidPincodes = pincodesArray.filter(
          (p) => !customFunction.pincodeValidation(p),
        );
        if (invalidPincodes.length > 0) {
          req.setFlash(
            "error",
            `Invalid pincode(s): ${invalidPincodes.join(", ")}. Each pincode must be exactly 6 digits.`,
          );
          return res.redirect("/panel/add-product");
        }
      }
      let pricesObject = null;
      if (prices) {
        try {
          pricesObject = JSON.parse(prices);
          if (!pricesObject || Object.keys(pricesObject).length === 0) {
            req.setFlash("error", "Please add at least one price.");
            return res.redirect("/panel/add-product");
          }
        } catch (e) {
          pricesObject = null;
        }
      }

      let variationsObject = null;
      if (variations) {
        try {
          variationsObject = JSON.parse(variations);
        } catch (e) {
          variationsObject = null;
        }
      }

      await insertProduct({
        admin_token,
        product_token,
        category_token,
        sub_category_token: sub_category_token || null,
        child_category_token: child_category_token || null,
        grand_child_category_token: grand_child_category_token || null,
        name: product_name,
        slug,
        description,
        instructions,
        delivery_info,
        pincodes: pincodesArray,
        images: imagesObject,
        prices: pricesObject,
        variations: variationsObject,
        product_type: product_type || null,
      });

      req.setFlash("success", "Product added successfully!");
      return res.redirect("/panel/products-list");
    } catch (error) {
      console.error("Error in saveProduct:", error);
      req.setFlash("error", "Failed to add product. Please try again.");
      return res.redirect("/panel/add-product");
    }
  },
  // SOFT DELETE PRODUCT
  deleteProduct: async (req, res) => {
    try {
      const { product_token } = req.body;
      if (!product_token) {
        req.setFlash("error", "Product not found.");
        return res.redirect("/panel/products-list");
      }
      await softDeleteProduct(product_token);
      req.setFlash("success", "Product deleted successfully.");
      return res.redirect("/panel/products-list");
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      req.setFlash("error", "Failed to delete product.");
      return res.redirect("/panel/products-list");
    }
  },
  // TOGGLE PRODUCT STATUS
  toggleProductStatus: async (req, res) => {
    try {
      const { product_token, status } = req.body;
      if (!product_token) {
        req.setFlash("error", "Product not found.");
        return res.redirect("/panel/products-list");
      }
      await dbToggleStatus(product_token, status);
      req.setFlash(
        "success",
        status == 1 ? "Product unpublished." : "Product published.",
      );
      return res.redirect("/panel/products-list");
    } catch (error) {
      console.error("Error in toggleProductStatus:", error);
      req.setFlash("error", "Failed to update product status.");
      return res.redirect("/panel/products-list");
    }
  },
  editProduct: async (req, res) => {
    try {
      const { token } = req.params;
      const product = await getProductByToken(token);
      if (!product) {
        req.setFlash("error", "Product not found.");
        return res.redirect("/panel/products-list");
      }
      product.priceObj = product.prices ? JSON.parse(product.prices) : {};
      product.variationsArr = product.variations
        ? JSON.parse(product.variations)
        : [];
      product.pincodesArr = product.pincodes
        ? JSON.parse(product.pincodes)
        : [];
      product.imagesObj = product.images ? JSON.parse(product.images) : {};

      const mainCategories = await getMainCategories();
      res.render("panel/productManagement/edit-product", {
        title: "Edit Product",
        product,
        mainCategories,
      });
    } catch (error) {
      console.error("Error in editProduct GET:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  // UPDATE PRODUCT (POST)
  updateProduct: async (req, res) => {
    try {
      const { token } = req.params;
      const {
        category_token,
        sub_category_token,
        child_category_token,
        grand_child_category_token,
        product_name,
        description,
        instructions,
        delivery_info,
        pincodes,
        variations,
        prices,
        product_type,
      } = req.body;

      if (!category_token || !product_name) {
        req.setFlash("error", "Please fill all required fields.");
        return res.redirect(`/panel/edit-product/${token}`);
      }

      const slug = customFunction.generateSlug(product_name);

      let pincodesArray = [];
      if (pincodes) {
        pincodesArray = pincodes
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
        const invalidPincodes = pincodesArray.filter(
          (p) => !customFunction.pincodeValidation(p),
        );
        if (invalidPincodes.length > 0) {
          req.setFlash(
            "error",
            `Invalid pincode(s): ${invalidPincodes.join(", ")}.`,
          );
          return res.redirect(`/panel/edit-product/${token}`);
        }
      }

      let pricesObject = null;
      if (prices) {
        try {
          pricesObject = JSON.parse(prices);
          if (!pricesObject || Object.keys(pricesObject).length === 0) {
            req.setFlash("error", "Please add at least one price.");
            return res.redirect(`/panel/edit-product/${token}`);
          }
        } catch (e) {
          pricesObject = null;
        }
      }

      let variationsObject = null;
      if (variations) {
        try {
          variationsObject = JSON.parse(variations);
        } catch (e) {
          variationsObject = null;
        }
      }

      const existingProduct = await getProductByToken(token);
      let imagesObject = existingProduct.images
        ? JSON.parse(existingProduct.images)
        : null;
      const files = req.files || [];
      if (files.length > 0) {
        imagesObject = {
          primary: files[0].filename,
          gallery: files.map((f) => f.filename),
        };
      }

      await dbUpdateProduct(token, {
        category_token,
        sub_category_token: sub_category_token || null,
        child_category_token: child_category_token || null,
        grand_child_category_token: grand_child_category_token || null,
        name: product_name,
        slug,
        description,
        instructions,
        delivery_info,
        pincodes: pincodesArray,
        images: imagesObject,
        prices: pricesObject,
        variations: variationsObject,
        product_type: product_type || null,
      });

      req.setFlash("success", "Product updated successfully!");
      return res.redirect("/panel/products-list");
    } catch (error) {
      console.error("Error in updateProduct:", error);
      req.setFlash("error", "Failed to update product.");
      return res.redirect(`/panel/edit-product/${req.params.token}`);
    }
  },
  //PRODUCTS LIST PAGE
  productList: async (req, res) => {
    try {
      const search = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = 10;

      const selectedCurrency = req.query.currency || "INR";

      const products = await getAllProducts(search, page, limit);
      const totalItems = await countProducts(search);
      const totalPages = Math.ceil(totalItems / limit);

      res.render("panel/productManagement/products-list", {
        title: "Products List",
        products,
        search,
        currentPage: page,
        totalPages,
        totalItems,
        selectedCurrency,
      });
    } catch (error) {
      console.error("Error in productList:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  //API: SUB CATEGORIES
  getSubCategories: async (req, res) => {
    try {
      const { token } = req.params;
      const data = await getSubCategoriesByMainCategory(token);
      return res.json(data);
    } catch (error) {
      console.error("Error in getSubCategories API:", error);
      return res.status(500).json({ error: "Failed to load sub categories" });
    }
  },
  //API: CHILD CATEGORIES
  getChildCategories: async (req, res) => {
    try {
      const { token } = req.params;
      const data = await getChildCategoriesBySubCategory(token);
      return res.json(data);
    } catch (error) {
      console.error("Error in getChildCategories API:", error);
      return res.status(500).json({ error: "Failed to load child categories" });
    }
  },
  // GRAND CHILD CATEGORIES
  getGrandChildCategories: async (req, res) => {
    try {
      const { token } = req.params;
      const data = await getGrandChildCategoriesByChildCategory(token);
      return res.json(data);
    } catch (error) {
      console.error("Error in getGrandChildCategories API:", error);
      return res
        .status(500)
        .json({ error: "Failed to load grand child categories" });
    }
  },
  //GALLERY FUNCTIONS
  uploadChunk: async (req, res) => {
    try {
      const admin_token = req.session.user.token;
      const fileId = req.body.fileId?.trim();
      const filename = req.body.filename?.trim();
      const chunkIndex = parseInt(req.body.chunkIndex, 10);
      const totalChunks = parseInt(req.body.totalChunks, 10);
      const chunk = req.file;
      const tmpDir = path.join(
        __dirname,
        "../../public/uploads/gallery/tmp",
        fileId,
      );

      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const chunkPath = path.join(tmpDir, `chunk_${chunkIndex}`);
      fs.renameSync(chunk.path, chunkPath);

      const receivedChunks = fs.readdirSync(tmpDir).length;
      if (receivedChunks < parseInt(totalChunks)) {
        return res.json({ success: true, message: "Chunk received" });
      }

      const ext = path.extname(filename) || ".jpg";
      const finalName = fileId + ext;
      const finalPath = path.join(
        __dirname,
        "../../public/uploads/gallery",
        finalName,
      );
      const writeStream = fs.createWriteStream(finalPath);

      for (let i = 0; i < parseInt(totalChunks); i++) {
        const data = fs.readFileSync(path.join(tmpDir, `chunk_${i}`));
        writeStream.write(data);
      }
      writeStream.end();

      fs.rmSync(tmpDir, { recursive: true, force: true });

      const name = finalName;
      const slug = customFunction.generateSlug(name);
      await insertGallery({ admin_token, name, slug, image: finalName });
      return res.json({ success: true, message: "File uploaded successfully" });
    } catch (error) {
      console.error("Error in uploadChunk:", error);
      return res
        .status(500)
        .json({ success: false, message: "Chunk upload failed" });
    }
  },
  //Products Gallery
  productGallery: async (req, res) => {
    try {
      const search = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = 12;

      const gallery = await getAllGallery(search, page, limit);
      const totalItems = await countGallery(search);
      const totalPages = Math.ceil(totalItems / limit);

      res.render("panel/productManagement/products-gallery", {
        title: "Product Gallery",
        gallery,
        search,
        currentPage: page,
        totalPages,
        totalItems,
      });
    } catch (error) {
      console.error("Error in productGallery:", error);
      req.setFlash("error", "Failed to load gallery.");
      res.redirect("/");
    }
  },
  //Add Gallery
  addGallery: async (req, res) => {
    try {
      const admin_token = req.session.user.token;
      const image = req.file ? req.file.filename : null;

      if (!image) {
        req.setFlash("error", "Image is required.");
        return res.redirect("/panel/product-gallery");
      }

      const name = image;
      const slug = customFunction.generateSlug(name);
      await insertGallery({ admin_token, name, slug, image });
      req.setFlash("success", "Added Image in Gallery");
      return res.redirect("/panel/product-gallery");
    } catch (error) {
      console.error("Error in addGallery:", error);
      req.setFlash("error", "Failed to add gallery post.");
      return res.redirect("/panel/product-gallery");
    }
  },
  //Edit Gallery
  editGallery: async (req, res) => {
    try {
      const { id, name } = req.body;
      const image = req.file ? req.file.filename : null;

      if (!name) {
        req.setFlash("error", "Name is required.");
        return res.redirect("/panel/product-gallery");
      }

      const slug = customFunction.generateSlug(name);
      await updateGallery(id, { name, slug, image });
      return res.redirect("/panel/product-gallery");
    } catch (error) {
      console.error("Error in editGallery:", error);
      req.setFlash("error", "Failed to update gallery post.");
      return res.redirect("/panel/product-gallery");
    }
  },
  //Toggle Status
  toggleStatus: async (req, res) => {
    try {
      const { id, status } = req.body;
      await toggleGalleryStatus(id, status);
      return res.redirect("/panel/product-gallery");
    } catch (error) {
      console.error("Error in toggleStatus:", error);
      return res.redirect("/panel/product-gallery");
    }
  },
  //Delete Gallery
  deleteGallery: async (req, res) => {
    try {
      const { id } = req.body;
      await deleteGallery(id);
      return res.redirect("/panel/product-gallery");
    } catch (error) {
      console.error("Error in deleteGallery:", error);
      req.setFlash("error", "Failed to delete gallery post.");
      return res.redirect("/panel/product-gallery");
    }
  },
};

module.exports = productController;
