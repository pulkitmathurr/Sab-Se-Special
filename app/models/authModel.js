const { pool } = require("../config/config");

async function getAdminData(email) {
    const sql = 'SELECT * FROM tbl_admin WHERE email = ?';
    try {
        const [rows] = await pool.promise().execute(sql, [email]);
        return rows;
    } catch (err) {
        throw err;
    }
}

 async function insertLoginHistory(user_id, ip_address, user_agent){
    const sql = `
        INSERT INTO tbl_login_history (user_id, ip_address, user_agent)
        VALUES (?, ?, ?)
    `;

    try {
        await pool.promise().execute(sql, [user_id, ip_address, user_agent]);
        return true;
    } catch (err) {
        throw err;
    }
};

async function getAdminDataByToken(token) {
    const sql = 'SELECT * FROM tbl_admin WHERE token = ?';
    try {
        const [rows] = await pool.promise().execute(sql, [token]);
        return rows;
    } catch (err) {
        throw err;
    }
}

 async function updatePassword(token, hashedPassword) {
    const sql = 'UPDATE tbl_admin SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE token = ?';
    try {
      const [result] = await pool.promise().execute(sql, [hashedPassword, token]);
      return result;
    } catch (err) {
      throw err;
    }
  }
  async function updateProfileModel(userToken, data) {
    try {
        const { fname, lname, email, phone, profileImage,designation } = data;
        let sql = `
            UPDATE tbl_admin
            SET fname = ?, lname = ?, email = ?,designation=?, phone_no = ? ${profileImage ? ', profile_image = ?' : ''}
            WHERE token = ?
        `;
        let params = profileImage
            ? [fname, lname, email,designation, phone, profileImage, userToken]
            : [fname, lname, email,designation, phone, userToken];
 
        const [result] = await pool.promise().execute(sql, params);
        return result.affectedRows > 0;
    } catch (err) {
        throw err;
    }
}

module.exports = { getAdminData,insertLoginHistory, getAdminDataByToken, updatePassword, updateProfileModel };