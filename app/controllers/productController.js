const customFunction = require("../middleware/customFunction");
const {insertGallery,getAllGallery,countGallery,updateGallery,toggleGalleryStatus,deleteGallery} = require("../models/productGalleryModel");

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
}
const productController = {

    productList: (req, res) => {
        try {
            res.render("panel/productManagement/products-list", { title: "Product List" });
        } catch (error) {
            console.error("Error in productList:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    addProduct: (req, res) => {
        try {
            res.render("panel/productManagement/add-products", { title: "Add Product" });
        } catch (error) {
            console.error("Error in addProduct:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    productGallery: async (req, res) => {
        try {
            const search = req.query.search || '';
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
                totalItems
            });
        } catch (error) {
            console.error("Error in productGallery:", error);
            req.setFlash('error', 'Failed to load gallery.');
            res.redirect('/');
        }
    },

    addGallery: async (req, res) => {
    try {
        const admin_token = req.session.user.token;
        const image = req.file ? req.file.filename : null;

        if (!image) {
            req.setFlash('error', 'Image is required.');
            return res.redirect('/panel/product-gallery');
        }

        const name = image;
        const slug = generateSlug(name);
        await insertGallery({ admin_token, name, slug, image });
        return res.redirect('/panel/product-gallery');
    } catch (error) {
        console.error("Error in addGallery:", error);
        req.setFlash('error', 'Failed to add gallery post.');
        return res.redirect('/panel/product-gallery');
    }
},

    editGallery: async (req, res) => {
        try {
            const { id, name } = req.body;
            const image = req.file ? req.file.filename : null;

            if (!name) {
                req.setFlash('error', 'Name is required.');
                return res.redirect('/panel/product-gallery');
            }

            const slug = generateSlug(name);
            await updateGallery(id, { name, slug, image });

            return res.redirect('/panel/product-gallery');
        } catch (error) {
            console.error("Error in editGallery:", error);
            req.setFlash('error', 'Failed to update gallery post.');
            return res.redirect('/panel/product-gallery');
        }
    },

    toggleStatus: async (req, res) => {
        try {
            const { id, status } = req.body;
            await toggleGalleryStatus(id, status);

            return res.redirect('/panel/product-gallery');
        } catch (error) {
            console.error("Error in toggleStatus:", error);

            return res.redirect('/panel/product-gallery');
        }
    },

    deleteGallery: async (req, res) => {
        try {
            const { id } = req.body;
            await deleteGallery(id);
            return res.redirect('/panel/product-gallery');
        } catch (error) {
            console.error("Error in deleteGallery:", error);
            req.setFlash('error', 'Failed to delete gallery post.');
            return res.redirect('/panel/product-gallery');
        }
    }
};

module.exports = productController;