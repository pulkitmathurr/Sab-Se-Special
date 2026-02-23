const { pool } = require("../config/config");

async function insertGallery(data) {
  try {
    const sql = `
            INSERT INTO tbl_product_gallery
            (admin_token, name, slug, image, status, flag)
            VALUES (?, ?, ?, ?, 1, 1)
        `;
    const [result] = await pool.promise().execute(sql, [
      data.admin_token,
      data.name,
      data.slug,
      data.image,
    ]);
    return result;
  } catch (err) {
    console.error("Insert gallery error:", err);
    throw err;
  }
}

async function getAllGallery(search = '', page = 1, limit = 12) {
  const offset = (page - 1) * limit;
  let sql = `
            SELECT * 
            FROM tbl_product_gallery 
            WHERE flag = 1
        `;
  let params = [];
  if (search) {
    sql += ` AND name LIKE ?`;
    params.push(`%${search}%`);
  }
  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  try {
    const [rows] = await pool.promise().execute(sql, params);
    return rows;
  } catch (err) {
    console.error("Error in getAllGallery:", err);
    throw err;
  }
}

async function countGallery(search = '') {
  let sql = `
            SELECT COUNT(*) as total 
            FROM tbl_product_gallery 
            WHERE flag = 1
        `;
  let params = [];
  if (search) {
    sql += ` AND name LIKE ?`;
    params.push(`%${search}%`);
  }
  try {
    const [rows] = await pool.promise().execute(sql, params);
    return rows[0].total;
  } catch (err) {
    console.error("Error in countGallery:", err);
    throw err;
  }
}

async function updateGallery(id, data) {
  let sql = `
            UPDATE tbl_product_gallery
            SET name = ?, slug = ?
        `;
  let params = [data.name, data.slug];

  if (data.image) {
    sql += `, image = ?`;
    params.push(data.image);
  }

  sql += ` WHERE id = ?`;
  params.push(id);

  try {
    const [result] = await pool.promise().execute(sql, params);
    return result;
  } catch (err) {
    console.error("Error in updateGallery:", err);
    throw err;
  }
}

async function toggleGalleryStatus(id, status) {
  const sql = `
            UPDATE tbl_product_gallery 
            SET status = ? 
            WHERE id = ?
        `;
  try {
    const [result] = await pool.promise().execute(sql, [status, id]);
    return result;
  } catch (err) {
    console.error("Error in toggleGalleryStatus:", err);
    throw err;
  }
}

async function deleteGallery(id) {
  const sql = `
            UPDATE tbl_product_gallery 
            SET flag = 0 
            WHERE id = ?
        `;
  try {
    const [result] = await pool.promise().execute(sql, [id]);
    return result;
  } catch (err) {
    console.error("Error in deleteGallery:", err);
    throw err;
  }
}

module.exports = {
  insertGallery,
  getAllGallery,
  countGallery,
  updateGallery,
  toggleGalleryStatus,
  deleteGallery,
};