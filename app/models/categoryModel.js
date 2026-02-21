const { pool } = require("../config/config");

async function getMainCategories() {
  const sql = `
            SELECT * 
            FROM tbl_main_category 
            WHERE flag = 0
            ORDER BY id DESC
        `;
  try {
    const [rows] = await pool.promise().execute(sql);
    return rows;
  } catch (err) {
    console.error("Error in getMainCategories:", err);
    throw err;
  }
}

async function insertMainCategory(data) {
  try {
    const sql = `
            INSERT INTO tbl_main_category
            (admin_token, category_token, name, slug, description, image, status, flag)
            VALUES (?, ?, ?, ?, ?, ?, 1, 0)
        `;

    const [result] = await pool.promise().execute(sql, [
        data.admin_token,
        data.category_token,
        data.name,
        data.slug,
        data.description,
        data.image,
      ]);

    return result;
  } catch (err) {
    console.error("Insert main category error:", err);
    throw err;
  }
}

async function deleteMainCategory(categoryToken) {
  const sql = `
            UPDATE tbl_main_category
            SET flag = 1
            WHERE category_token = ?
        `;
  try {
    const [result] = await pool.promise().execute(sql, [categoryToken]);
    return result;
  } catch (err) {
    console.error("Error in deleteMainCategory:", err);
    throw err;
  }
}


async function unpublishMainCategory(categoryToken) {
    const sql = `
        UPDATE tbl_main_category 
        SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END 
        WHERE category_token = ?
    `;
    try {
        const [result] = await pool.promise().execute(sql, [categoryToken]);
        return result;
    } catch (err) {
        console.error("Error in unpublishMainCategory:", err);
        throw err;
    }
}

async function updateMainCategory(token, name, description, file) {
  let sql = `
    UPDATE tbl_main_category
    SET name = ?, description = ?
  `;
  let params = [name, description];

  if (file) {
    sql += `, image = ?`;
    params.push(file.filename);
  }

  sql += ` WHERE category_token = ?`;
  params.push(token);

  try {
    const [result] = await pool.promise().execute(sql, params);
    return result;
  } catch (err) {
    console.error("Error in updateMainCategory:", err);
    throw err;
  }
}

async function getCategoryByName(name) {
  const sql = `
        SELECT id FROM tbl_main_category
        WHERE name = ? AND flag = 0
        LIMIT 1
    `;
  try {
    const [rows] = await pool.promise().execute(sql, [name]);
    return rows;
  } catch (err) {
    console.error("Error in getCategoryByName:", err);
    throw err;
  }
}

async function getMainCategoryByToken(token) {
  const sql = `
        SELECT * FROM tbl_main_category
        WHERE category_token = ? AND flag = 0
        LIMIT 1
    `;
  try {
    const [rows] = await pool.promise().execute(sql, [token]);
    return rows[0];
  }
  catch (err) {
    console.error("Error in getMainCategoriesByToken:", err);
    throw err;
  } 
}

module.exports = {
  getMainCategories,
  getMainCategoryByToken,
  updateMainCategory,
  insertMainCategory,
  unpublishMainCategory,
  deleteMainCategory,
  getCategoryByName,
};
