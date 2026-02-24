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

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}
const productController = {
  productList: (req, res) => {
    try {
      res.render("panel/productManagement/products-list", {
        title: "Product List",
      });
    } catch (error) {
      console.error("Error in productList:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  addProduct: (req, res) => {
    try {
      res.render("panel/productManagement/add-products", {
        title: "Add Product",
      });
    } catch (error) {
      console.error("Error in addProduct:", error);
      res.status(500).send("Internal Server Error");
    }
  },

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
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      await insertGallery({ admin_token, name, slug, image: finalName });
      return res.json({ success: true, message: "File uploaded successfully" });
    } catch (error) {
      console.error("Error in uploadChunk:", error);
      
      return res
        .status(500)
        .json({ success: false, message: "Chunk upload failed" });
    }
  },

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

  addGallery: async (req, res) => {
    try {
      const admin_token = req.session.user.token;
      const image = req.file ? req.file.filename : null;

      if (!image) {
        req.setFlash("error", "Image is required.");
        return res.redirect("/panel/product-gallery");
      }

      const name = image;
      const slug = generateSlug(name);
      await insertGallery({ admin_token, name, slug, image });
      req.setFlash("success","Added Image in Gallery");
      return res.redirect("/panel/product-gallery");
    } catch (error) {
      console.error("Error in addGallery:", error);
      req.setFlash("error", "Failed to add gallery post.");
      return res.redirect("/panel/product-gallery");
    }
  },

  editGallery: async (req, res) => {
    try {
      const { id, name } = req.body;
      const image = req.file ? req.file.filename : null;

      if (!name) {
        req.setFlash("error", "Name is required.");
        return res.redirect("/panel/product-gallery");
      }

      const slug = generateSlug(name);
      await updateGallery(id, { name, slug, image });

      return res.redirect("/panel/product-gallery");
    } catch (error) {
      console.error("Error in editGallery:", error);
      req.setFlash("error", "Failed to update gallery post.");
      return res.redirect("/panel/product-gallery");
    }
  },

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
