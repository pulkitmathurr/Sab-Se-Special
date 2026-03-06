const { pool } = require("../config/config");

// ===== DYNAMIC DROPDOWNS =====

async function getSubCategoriesByMainCategory(category_token) {
  const sql = `
    SELECT sub_category_token, name 
    FROM tbl_sub_category 
    WHERE category_token = ? 
    AND flag = 0 
    AND status = 1 
    ORDER BY name ASC
  `;
  try {
    const [rows] = await pool.promise().execute(sql, [category_token]);
    return rows;
  } catch (err) {
    console.error("Error in getSubCategoriesByMainCategory:", err);
    throw err;
  }
}

async function getChildCategoriesBySubCategory(sub_category_token) {
  const sql = `
    SELECT child_category_token, name 
    FROM tbl_child_category 
    WHERE sub_category_token = ? 
    AND flag = 0 
    AND status = 1 
    ORDER BY name ASC
  `;
  try {
    const [rows] = await pool.promise().execute(sql, [sub_category_token]);
    return rows;
  } catch (err) {
    console.error("Error in getChildCategoriesBySubCategory:", err);
    throw err;
  }
}

async function getGrandChildCategoriesByChildCategory(child_category_token) {
  const sql = `
    SELECT grand_child_category_token, name 
    FROM tbl_grand_child_category 
    WHERE child_category_token = ? 
    AND flag = 0 
    AND status = 1 
    ORDER BY name ASC
  `;
  try {
    const [rows] = await pool.promise().execute(sql, [child_category_token]);
    return rows;
  } catch (err) {
    console.error("Error in getGrandChildCategoriesByChildCategory:", err);
    throw err;
  }
}

async function insertProduct(data) {
  const sql = `
    INSERT INTO tbl_products (
      admin_token,
      product_token,
      category_token,
      sub_category_token,
      child_category_token,
      grand_child_category_token,
      name,
      slug,
      description,
      instructions,
      delivery_info,
      pincodes,
      images,
      prices,
      variations,
      product_type,
      status,
      flag
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, 1, 0)
  `;
  try {
    const [result] = await pool.promise().execute(sql, [
      data.admin_token,
      data.product_token,
      data.category_token,
      data.sub_category_token || null,
      data.child_category_token || null,
      data.grand_child_category_token || null,
      data.name,
      data.slug,
      data.description || null,
      data.instructions || null,
      data.delivery_info || null,
      JSON.stringify(data.pincodes) || null,
      JSON.stringify(data.images) || null,
      JSON.stringify(data.prices) || null,
      JSON.stringify(data.variations) || null,
      data.product_type || null,
    ]);
    return result;
  } catch (err) {
    console.error("Error in insertProduct:", err);
    throw err;
  }
}

async function getAllProducts(search = "", page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  let sql = `
    SELECT 
      p.*,
      m.name AS main_category_name,
      s.name AS sub_category_name,
      c.name AS child_category_name,
      g.name AS grand_child_category_name
    FROM tbl_products p
    LEFT JOIN tbl_main_category m 
      ON p.category_token = m.category_token
    LEFT JOIN tbl_sub_category s 
      ON p.sub_category_token = s.sub_category_token
    LEFT JOIN tbl_child_category c 
      ON p.child_category_token = c.child_category_token
    LEFT JOIN tbl_grand_child_category g 
      ON p.grand_child_category_token = g.grand_child_category_token
    WHERE p.flag = 0
  `;

  const params = [];

  if (search) {
    sql += ` AND p.name LIKE ?`;
    params.push(`%${search}%`);
  }

  sql += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  try {
    const [rows] = await pool.promise().execute(sql, params);

    rows.forEach((row) => {
      try {
        row.priceObj = row.prices ? JSON.parse(row.prices) : {};
      } catch (e) {
        row.priceObj = {};
      }
    });

    return rows;
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    throw err;
  }
}

async function countProducts(search = "") {
  let sql = `SELECT COUNT(*) as total FROM tbl_products WHERE flag = 0`;
  const params = [];
  if (search) {
    sql += ` AND name LIKE ?`;
    params.push(`%${search}%`);
  }
  try {
    const [rows] = await pool.promise().execute(sql, params);
    return rows[0].total;
  } catch (err) {
    console.error("Error in countProducts:", err);
    throw err;
  }
}

async function getProductByToken(product_token) {
  const sql = `SELECT * FROM tbl_products WHERE product_token = ? AND flag = 0`;
  try {
    const [rows] = await pool.promise().execute(sql, [product_token]);
    return rows[0];
  } catch (err) {
    console.error("Error in getProductByToken:", err);
    throw err;
  }
}
async function softDeleteProduct(product_token) {
  const sql = `UPDATE tbl_products SET flag = 1 WHERE product_token = ?`;
  try {
    const [result] = await pool.promise().execute(sql, [product_token]);
    return result;
  } catch (err) {
    console.error("Error in softDeleteProduct:", err);
    throw err;
  }
}

async function toggleProductStatus(product_token, currentStatus) {
  const newStatus = currentStatus == 1 ? 0 : 1;
  const sql = `UPDATE tbl_products SET status = ? WHERE product_token = ?`;
  try {
    const [result] = await pool
      .promise()
      .execute(sql, [newStatus, product_token]);
    return result;
  } catch (err) {
    console.error("Error in toggleProductStatus:", err);
    throw err;
  }
}

async function updateProduct(product_token, data) {
  const sql = `
    UPDATE tbl_products SET
      category_token = ?,
      sub_category_token = ?,
      child_category_token = ?,
      grand_child_category_token = ?,
      name = ?,
      slug = ?,
      description = ?,
      instructions = ?,
      delivery_info = ?,
      pincodes = ?,
      images = ?,
      prices = ?,
      variations = ?,
      product_type = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_token = ? AND flag = 0
  `;
  try {
    const [result] = await pool
      .promise()
      .execute(sql, [
        data.category_token,
        data.sub_category_token || null,
        data.child_category_token || null,
        data.grand_child_category_token || null,
        data.name,
        data.slug,
        data.description || null,
        data.instructions || null,
        data.delivery_info || null,
        JSON.stringify(data.pincodes) || null,
        JSON.stringify(data.images) || null,
        JSON.stringify(data.prices) || null,
        JSON.stringify(data.variations) || null,
        data.product_type || null,
        product_token,
      ]);
    return result;
  } catch (err) {
    console.error("Error in updateProduct:", err);
    throw err;
  }
}
module.exports = {
  getSubCategoriesByMainCategory,
  getChildCategoriesBySubCategory,
  getGrandChildCategoriesByChildCategory,
  insertProduct,
  getAllProducts,
  countProducts,
  getProductByToken,
  softDeleteProduct,
  toggleProductStatus,
  updateProduct,
};
