const { pool } = require("../config/config");

async function getChildCategories() {
    const sql = `
        SELECT c.*, m.name AS main_category_name, s.name AS sub_category_name
        FROM tbl_child_category c
        LEFT JOIN tbl_main_category m ON c.category_token = m.category_token
        LEFT JOIN tbl_sub_category s ON c.sub_category_token = s.sub_category_token
        WHERE c.flag = 0
        ORDER BY c.id DESC
    `;
    try {
        const [rows] = await pool.promise().execute(sql);
        return rows;
    } catch (err) {
        console.error("Error in getChildCategories:", err);
        throw err;
    }
}

async function insertChildCategory(data) {
    const sql = `
        INSERT INTO tbl_child_category
        (admin_token, category_token, sub_category_token, child_category_token, name, slug, description, image, status, flag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;
    try {
        const [result] = await pool.promise().execute(sql, [
            data.admin_token,
            data.category_token,
            data.sub_category_token,
            data.child_category_token,
            data.name,
            data.slug,
            data.description,
            data.image,
        ]);
        return result;
    } catch (err) {
        console.error("Error in insertChildCategory:", err);
        throw err;
    }
}

async function getChildCategoryByName(name) {
    const sql = `
        SELECT id FROM tbl_child_category
        WHERE name = ? AND flag = 0
        LIMIT 1
    `;
    try {
        const [rows] = await pool.promise().execute(sql, [name]);
        return rows;
    } catch (err) {
        console.error("Error in getChildCategoryByName:", err);
        throw err;
    }
}

async function getChildCategoryByToken(token) {
    const sql = `
        SELECT * FROM tbl_child_category
        WHERE child_category_token = ? AND flag = 0
        LIMIT 1
    `;
    try {
        const [rows] = await pool.promise().execute(sql, [token]);
        return rows[0];
    } catch (err) {
        console.error("Error in getChildCategoryByToken:", err);
        throw err;
    }
}

async function updateChildCategory(token, name, description, category_token, sub_category_token, file) {
    let sql = `
        UPDATE tbl_child_category
        SET name = ?, description = ?, category_token = ?, sub_category_token = ?
    `;
    let params = [name, description, category_token, sub_category_token];

    if (file) {
        sql += `, image = ?`;
        params.push(file.filename);
    }

    sql += ` WHERE child_category_token = ?`;
    params.push(token);

    try {
        const [result] = await pool.promise().execute(sql, params);
        return result;
    } catch (err) {
        console.error("Error in updateChildCategory:", err);
        throw err;
    }
}

async function deleteChildCategory(token) {
    const sql = `UPDATE tbl_child_category SET flag = 1 WHERE child_category_token = ?`;
    try {
        const [result] = await pool.promise().execute(sql, [token]);
        return result;
    } catch (err) {
        console.error("Error in deleteChildCategory:", err);
        throw err;
    }
}

async function unpublishChildCategory(token) {
    const sql = `
        UPDATE tbl_child_category 
        SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END 
        WHERE child_category_token = ?
    `;
    try {
        const [result] = await pool.promise().execute(sql, [token]);
        return result;
    } catch (err) {
        console.error("Error in unpublishChildCategory:", err);
        throw err;
    }
}

module.exports = {
    getChildCategories,
    insertChildCategory,
    getChildCategoryByName,
    getChildCategoryByToken,
    updateChildCategory,
    deleteChildCategory,
    unpublishChildCategory,
};