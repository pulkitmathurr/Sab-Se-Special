const { pool } = require("../config/config");

async function getSubCategories() {
  const sql = `
        SELECT s.*, m.name AS main_category_name
        FROM tbl_sub_category s
        LEFT JOIN tbl_main_category m ON s.category_token = m.category_token
        WHERE s.flag = 0
        ORDER BY s.id DESC
    `;
  try {
    const [rows] = await pool.promise().execute(sql);
    return rows;
  } catch (err) {
    console.error("Error in getSubCategories:", err);
    throw err;
  }
}

async function insertSubCategory(data) {
  const sql = `
        INSERT INTO tbl_sub_category
        (admin_token, sub_category_token, category_token, name, slug, description, image, status, flag)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;
  try {
    const [result] = await pool
      .promise()
      .execute(sql, [
        data.admin_token,
        data.sub_category_token,
        data.category_token,
        data.name,
        data.slug,
        data.description,
        data.image,
      ]);
    return result;
  } catch (err) {
    console.error("Error in insertSubCategory:", err);
    throw err;
  }
}

async function getSubCategoryByName(name) {
  const sql = `
        SELECT id FROM tbl_sub_category
        WHERE name = ? AND flag = 0
        LIMIT 1
    `;
  try {
    const [rows] = await pool.promise().execute(sql, [name]);
    return rows;
  } catch (err) {
    console.error("Error in getSubCategoryByName:", err);
    throw err;
  }
}

async function deleteSubCategory(subCategoryToken) {
  const sql = `
        UPDATE tbl_sub_category
        SET flag = 1
        WHERE sub_category_token = ?
    `;
  try {
    const [result] = await pool.promise().execute(sql, [subCategoryToken]);
    return result;
  } catch (err) {
    console.error("Error in deleteSubCategory:", err);
    throw err;
  }
}

async function unpublishSubCategory(subCategoryToken) {
    const sql = `
        UPDATE tbl_sub_category 
        SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END 
        WHERE sub_category_token = ?
    `;
    try {
        const [result] = await pool.promise().execute(sql, [subCategoryToken]);
        return result;
    } catch (err) {
        console.error("Error in unpublishSubCategory:", err);
        throw err;
    }
}
async function updateSubCategory(token, name, description, category_token, file) {
    let sql = `
        UPDATE tbl_sub_category
        SET name = ?, description = ?, category_token = ?
    `;
    let params = [name, description, category_token];

    if (file) {
        sql += `, image = ?`;
        params.push(file.filename);
    }

    sql += ` WHERE sub_category_token = ?`;
    params.push(token);

    try {
        const [result] = await pool.promise().execute(sql, params);
        return result;
    } catch (err) {
        console.error("Error in updateSubCategory:", err);
        throw err;
    }
}

async function getSubCategoryByToken(token) {
    const sql = `
        SELECT * FROM tbl_sub_category
        WHERE sub_category_token = ? AND flag = 0
        LIMIT 1
    `;
    try {
        const [rows] = await pool.promise().execute(sql, [token]);
        return rows[0];
    } catch (err) {
        console.error("Error in getSubCategoryByToken:", err);
        throw err;
    }
}

module.exports = {
  getSubCategories,
  insertSubCategory,
  getSubCategoryByName,
  deleteSubCategory,
  unpublishSubCategory,
  updateSubCategory,
  getSubCategoryByToken
};
