const { pool } = require("../config/config");

async function getGrandChildCategories(search = '') {
    let sql = `
        SELECT g.*, 
               m.name AS main_category_name, 
               s.name AS sub_category_name,
               c.name AS child_category_name
        FROM tbl_grand_child_category g
        LEFT JOIN tbl_main_category m ON g.category_token = m.category_token
        LEFT JOIN tbl_sub_category s ON g.sub_category_token = s.sub_category_token
        LEFT JOIN tbl_child_category c ON g.child_category_token = c.child_category_token
        WHERE g.flag = 0
    `;
    let params = [];
    if (search) {
        sql += ` AND g.name LIKE ?`;
        params.push(`%${search}%`);
    }
    sql += ` ORDER BY g.id DESC`;
    try {
        const [rows] = await pool.promise().execute(sql, params);
        return rows;
    } catch (err) {
        console.error("Error in getGrandChildCategories:", err);
        throw err;
    }
}

async function insertGrandChildCategory(data) {
    const sql = `
        INSERT INTO tbl_grand_child_category
        (admin_token, category_token, sub_category_token, child_category_token, grand_child_category_token, name, slug, description, image, status, flag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;
    try {
        const [result] = await pool.promise().execute(sql, [
            data.admin_token,
            data.category_token,
            data.sub_category_token,
            data.child_category_token,
            data.grand_child_category_token,
            data.name,
            data.slug,
            data.description,
            data.image,
        ]);
        return result;
    } catch (err) {
        console.error("Error in insertGrandChildCategory:", err);
        throw err;
    }
}

async function getGrandChildCategoryByName(name) {
    const sql = `
        SELECT id FROM tbl_grand_child_category
        WHERE name = ? AND flag = 0
        LIMIT 1
    `;
    try {
        const [rows] = await pool.promise().execute(sql, [name]);
        return rows;
    } catch (err) {
        console.error("Error in getGrandChildCategoryByName:", err);
        throw err;
    }
}

async function getGrandChildCategoryByToken(token) {
    const sql = `
        SELECT * FROM tbl_grand_child_category
        WHERE grand_child_category_token = ? AND flag = 0
        LIMIT 1
    `;
    try {
        const [rows] = await pool.promise().execute(sql, [token]);
        return rows[0];
    } catch (err) {
        console.error("Error in getGrandChildCategoryByToken:", err);
        throw err;
    }
}

async function updateGrandChildCategory(token, name, description, category_token, sub_category_token, child_category_token, file) {
    let sql = `
        UPDATE tbl_grand_child_category
        SET name = ?, description = ?, category_token = ?, sub_category_token = ?, child_category_token = ?
    `;
    let params = [name, description, category_token, sub_category_token, child_category_token];

    if (file) {
        sql += `, image = ?`;
        params.push(file.filename);
    }

    sql += ` WHERE grand_child_category_token = ?`;
    params.push(token);

    try {
        const [result] = await pool.promise().execute(sql, params);
        return result;
    } catch (err) {
        console.error("Error in updateGrandChildCategory:", err);
        throw err;
    }
}

async function deleteGrandChildCategory(token) {
    const sql = `UPDATE tbl_grand_child_category SET flag = 1 WHERE grand_child_category_token = ?`;
    try {
        const [result] = await pool.promise().execute(sql, [token]);
        return result;
    } catch (err) {
        console.error("Error in deleteGrandChildCategory:", err);
        throw err;
    }
}

async function unpublishGrandChildCategory(token) {
    const sql = `
        UPDATE tbl_grand_child_category 
        SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END 
        WHERE grand_child_category_token = ?
    `;
    try {
        const [result] = await pool.promise().execute(sql, [token]);
        return result;
    } catch (err) {
        console.error("Error in unpublishGrandChildCategory:", err);
        throw err;
    }
}

module.exports = {
    getGrandChildCategories,
    insertGrandChildCategory,
    getGrandChildCategoryByName,
    getGrandChildCategoryByToken,
    updateGrandChildCategory,
    deleteGrandChildCategory,
    unpublishGrandChildCategory,
};