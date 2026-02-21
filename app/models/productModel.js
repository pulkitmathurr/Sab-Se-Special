const { pool } = require('../config/config');

async function getProducts() {
    const sql = "SELECT * FROM tbl_products WHERE deleted_at IS NULL";  
    try {
        const [rows] = await pool.promise().execute(sql);
        return rows;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getProducts
};