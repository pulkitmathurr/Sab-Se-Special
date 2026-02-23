const categoryModel = require("../models/categoryModel");
const customFunction = require("../middleware/customFunction");
const subcategoryModel = require("../models/subCategoryModel");
const childCategoryModel = require("../models/childCategoryModel");

const categoryController = {
  //main categories

  mainCategories: async (req, res) => {
    try {
      const search = req.query.search || "";

      let categories;
      if (search.trim()) {
        categories = await categoryModel.searchMainCategories(search.trim());
      } else {
        categories = await categoryModel.getMainCategories();
      }

      let editCategory = null;
      if (req.query.edit) {
        editCategory = await categoryModel.getMainCategoryByToken(
          req.query.edit,
        );
      }

      res.render("panel/categories/main-categories", {
        categories,
        editCategory,
        search, 
      });
    } catch (err) {
      console.error(err);
      res.send("Error loading categories");
    }
  },

  addMainCategory: async (req, res) => {
    try {
      const name = req.body.name.trim();
      const description = req.body.description
        ? req.body.description.trim()
        : null;

      if (!name) {
        req.setFlash("error", "Category name is required");
        return res.redirect("/main-categories");
      }

      const admin_token = req.session.user.token;
      const category_token = customFunction.generateToken(16);
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

      const image = req.file ? req.file.filename : null;

      const existing = await categoryModel.getCategoryByName(name);
      if (existing.length > 0) {
        req.setFlash("error", "Category with this name already exists");
        return res.redirect("/main-categories");
      }
      const data = {
        admin_token,
        category_token,
        name,
        slug,
        description,
        image,
      };

      await categoryModel.insertMainCategory(data);

      req.setFlash("success", "Category added successfully");
      res.redirect("/main-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error inserting category");
      res.redirect("/main-categories");
    }
  },

  editMainCategory: async (req, res) => {
    try {
      const category_token = req.body.category_token;
      const name = req.body.name.trim();
      const description = req.body.description
        ? req.body.description.trim()
        : null;

      await categoryModel.updateMainCategory(
        category_token,
        name,
        description,
        req.file,
      );

      res.redirect("/panel/main-categories");
    } catch (err) {
      console.error(err);
      res.send("Error updating category");
    }
  },

  unpublishMainCategory: async (req, res) => {
    try {
      const category_token = req.body.category_token;

      await categoryModel.unpublishMainCategory(category_token);

      req.setFlash("success", "Category unpublished successfully");
      res.redirect("/main-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error unpublishing category");
      res.redirect("/main-categories");
    }
  },

  deleteMainCategory: async (req, res) => {
    try {
      const category_token = req.body.category_token;
      if (!category_token) {
        req.setFlash("error", "Invalid category");
        return res.redirect("/main-categories");
      }
      await categoryModel.deleteMainCategory(category_token);
      req.setFlash("success", "Category deleted successfully");
      res.redirect("/main-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error deleting category");
      res.redirect("/main-categories");
    }
  },

  subCategories: async (req, res) => {
    try {
      const categories = await categoryModel.getMainCategories();
      const subcategories = await subcategoryModel.getSubCategories();

      let editSubCategory = null;

      if (req.query.edit) {
        editSubCategory = await subcategoryModel.getSubCategoryByToken(
          req.query.edit,
        );
      }

      res.render("panel/categories/sub-categories", {
        categories,
        subcategories,
        editCategory: editSubCategory, // ← ye pass karo
      });
    } catch (err) {
      console.error(err);
      res.send("Error loading sub categories");
    }
  },

  addSubCategory: async (req, res) => {
    try {
      const name = req.body.name.trim();
      const description = req.body.description
        ? req.body.description.trim()
        : null;
      const category_token = req.body.category_token;

      if (!name) {
        req.setFlash("error", "Sub category name is required");
        return res.redirect("/panel/sub-categories");
      }

      if (!category_token) {
        req.setFlash("error", "Please select a main category");
        return res.redirect("/panel/sub-categories");
      }

      const admin_token = req.session.user.token;
      const sub_category_token = customFunction.generateToken(16);
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      const image = req.file ? req.file.filename : null;

      const existing = await subcategoryModel.getSubCategoryByName(name);
      if (existing.length > 0) {
        req.setFlash("error", "Sub category with this name already exists");
        return res.redirect("/panel/sub-categories");
      }

      const data = {
        admin_token,
        sub_category_token,
        category_token,
        name,
        slug,
        description,
        image,
      };

      await subcategoryModel.insertSubCategory(data);

      req.setFlash("success", "Sub category added successfully");
      res.redirect("/panel/sub-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error inserting sub category");
      res.redirect("/panel/sub-categories");
    }
  },

  editSubCategory: async (req, res) => {
    try {
      const sub_category_token = req.body.sub_category_token;
      const name = req.body.name ? req.body.name.trim() : null;
      const description = req.body.description
        ? req.body.description.trim()
        : null;
      const category_token = req.body.category_token || null;

      if (!sub_category_token) {
        req.setFlash("error", "Invalid sub category");
        return res.redirect("/panel/sub-categories");
      }

      if (!name) {
        req.setFlash("error", "Sub category name is required");
        return res.redirect("/panel/sub-categories");
      }

      await subcategoryModel.updateSubCategory(
        sub_category_token,
        name,
        description,
        category_token,
        req.file,
      );

      req.setFlash("success", "Sub category updated successfully");
      res.redirect("/panel/sub-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error updating sub category");
      res.redirect("/panel/sub-categories");
    }
  },

  deleteSubCategory: async (req, res) => {
    try {
      const sub_category_token = req.body.sub_category_token;
      if (!sub_category_token) {
        req.setFlash("error", "Invalid sub category");
        return res.redirect("/panel/sub-categories");
      }
      await subcategoryModel.deleteSubCategory(sub_category_token);
      req.setFlash("success", "Sub category deleted successfully");
      res.redirect("/panel/sub-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error deleting sub category");
      res.redirect("/panel/sub-categories");
    }
  },

  unpublishSubCategory: async (req, res) => {
    try {
      const sub_category_token = req.body.sub_category_token;
      if (!sub_category_token) {
        req.setFlash("error", "Invalid sub category");
        return res.redirect("/panel/sub-categories");
      }
      await subcategoryModel.unpublishSubCategory(sub_category_token);
      req.setFlash("success", "Sub category unpublished successfully");
      res.redirect("/panel/sub-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error unpublishing sub category");
      res.redirect("/panel/sub-categories");
    }
  },

  //child categories
  addChildCategory: async (req, res) => {
    try {
      const name = req.body.name.trim();
      const description = req.body.description
        ? req.body.description.trim()
        : null;
      const category_token = req.body.category_token;
      const sub_category_token = req.body.sub_category_token;

      if (!name) {
        req.setFlash("error", "Child category name is required");
        return res.redirect("/panel/child-categories");
      }
      if (!category_token) {
        req.setFlash("error", "Please select a main category");
        return res.redirect("/panel/child-categories");
      }
      if (!sub_category_token) {
        req.setFlash("error", "Please select a sub category");
        return res.redirect("/panel/child-categories");
      }
      const admin_token = req.session.user.token;
      const child_category_token = customFunction.generateToken(16);
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      const image = req.file ? req.file.filename : null;
      const existing = await childCategoryModel.getChildCategoryByName(name);

      if (existing.length > 0) {
        req.setFlash("error", "Child category with this name already exists");
        return res.redirect("/panel/child-categories");
      }

      const data = {
        admin_token,
        child_category_token,
        category_token,
        sub_category_token,
        name,
        slug,
        description,
        image,
      };

      await childCategoryModel.insertChildCategory(data);
      req.setFlash("success", "Child category added successfully");
      res.redirect("/panel/child-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error inserting child category");
      res.redirect("/panel/child-categories");
    }
  },

  deleteChildCategory: async (req, res) => {
    try {
      const { child_category_token } = req.body;
      if (!child_category_token) {
        req.setFlash("error", "Invalid child category");
        return res.redirect("/panel/child-categories");
      }
      await childCategoryModel.deleteChildCategory(child_category_token);
      req.setFlash("success", "Child category deleted successfully");
      res.redirect("/panel/child-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error deleting child category");
      res.redirect("/panel/child-categories");
    }
  },

  editChildCategory: async (req, res) => {
    try {
      const child_category_token = req.body.child_category_token;
      const name = req.body.name ? req.body.name.trim() : null;
      const description = req.body.description
        ? req.body.description.trim()
        : null;
      const category_token = req.body.category_token || null;
      const sub_category_token = req.body.sub_category_token || null;

      if (!child_category_token) {
        req.setFlash("error", "Invalid child category");
        return res.redirect("/panel/child-categories");
      }
      if (!name) {
        req.setFlash("error", "Child category name is required");
        return res.redirect("/panel/child-categories");
      }
      await childCategoryModel.updateChildCategory(
        child_category_token,
        name,
        description,
        category_token,
        sub_category_token,
        req.file,
      );
      req.setFlash("success", "Child category updated successfully");
      res.redirect("/panel/child-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error updating child category");
      res.redirect("/panel/child-categories");
    }
  },

  unpublishChildCategory: async (req, res) => {
    try {
      const { child_category_token } = req.body;
      if (!child_category_token) {
        req.setFlash("error", "Invalid child category");
        return res.redirect("/panel/child-categories");
      }
      await childCategoryModel.unpublishChildCategory(child_category_token);
      req.setFlash("success", "Child category unpublished successfully");
      res.redirect("/panel/child-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error unpublishing child category");
      res.redirect("/panel/child-categories");
    }
  },

  unpublishChildCategory: async (req, res) => {
    try {
      const { child_category_token } = req.body;
      if (!child_category_token) {
        req.setFlash("error", "Invalid child category");
        return res.redirect("/panel/child-categories");
      }
      await childCategoryModel.unpublishChildCategory(child_category_token);
      req.setFlash("success", "Status updated successfully");
      res.redirect("/panel/child-categories");
    } catch (err) {
      console.error(err);
      req.setFlash("error", "Error updating status");
      res.redirect("/panel/child-categories");
    }
  },

  childCategories: async (req, res) => {
    try {
      const categories = await categoryModel.getMainCategories();
      const subcategories = await subcategoryModel.getSubCategories();
      const childCategories = await childCategoryModel.getChildCategories();

      let editCategory = null;
      if (req.query.edit) {
        editCategory = await childCategoryModel.getChildCategoryByToken(
          req.query.edit,
        );
      }

      res.render("panel/categories/child-categories", {
        categories,
        subcategories,
        childCategories,
        editCategory,
      });
    } catch (err) {
      console.error(err);
      res.send("Error: " + err.message);
    }
  },
};

module.exports = categoryController;
