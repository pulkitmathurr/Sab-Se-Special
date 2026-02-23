const { key } = require("../config/config");
const customFunction = require("../middleware/customFunction");
const {
  getAdminData,
  insertLoginHistory,
  getAdminDataByToken,
  updateProfileModel,
  updatePasswordModel,
  updatePassword,
} = require("../models/authModel");

const AuthController = {
  login: (req, res) => {
    try {
      res.render("auth/login", { title: "login" });
    } catch (error) {
      console.error("Error rendering login page:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  postLogin: async (req, res) => {
    try {
      const email = req.body.email.trim();
      const password = req.body.password.trim();

      if (!email || !password) {
        req.setFlash("error", "Email and password are required.");
        return res.redirect("/login");
      }

      if (!customFunction.validateEmail(email)) {
        req.setFlash("error", "Enter valid Email");
        return res.redirect("/login");
      }

      const adminData = await getAdminData(email);

      if (!adminData || !adminData[0]) {
        req.setFlash("error", "Email and Password is Incorrect");
        return res.redirect("/login");
      }

      if (adminData[0].status === 0) {
        req.setFlash("error", "Your account is blocked. Please contact admin.");
        return res.redirect("/login");
      }

      const decrypt_pass = customFunction.decrypt(adminData[0].password, key);

      if (password !== decrypt_pass) {
        req.setFlash("error", "Email And Password is Incorrect");
        return res.redirect("/login");
      }

      req.session.regenerate(async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Failed to regenerate session");
        }

        req.session.user = {
          token: adminData[0].token,
          userIp: req.ip.replace("::ffff:", ""),
          userAgent: req.headers["user-agent"],
        };

        const ip = req.ip.replace("::ffff:", "");
        const user_agent = req.headers["user-agent"];
        const user_id = adminData[0].token;

        try {
          await insertLoginHistory(user_id, ip, user_agent);
          console.log("Login History saved!");
        } catch (err) {
          console.log("Login history insert error:", err);
        }

        req.setFlash("success", "Login Successful");
        res.redirect("/");
      });
    } catch (err) {
      console.log(err);
      req.setFlash(
        "error",
        "There was an error logging in. Please try again later.",
      );
      return res.redirect("/login");
    }
  },

  getProfile: async (req, res) => {
    try {
      res.render("panel/profile", { title: "My Profile" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  postProfile: async (req, res) => {
    try {
      const token = req.session.user.token;
      const { fname, lname, email, new_password, confirm_password } = req.body;
      const profileImage = req.file ? req.file.filename : null;

      if (!customFunction.validateEmail(email)) {
        req.setFlash("error", "Please enter a valid email address.");
        return res.redirect("/profile");
      }

      const existingAdmin = await getAdminDataByToken(token);
      if (!existingAdmin || existingAdmin.length === 0) {
        req.setFlash("error", "Admin not found.");
        return res.redirect("/profile");
      }

      const updateData = {
        fname,
        lname,
        email,
        phone: existingAdmin[0].phone_no || "",
        designation: existingAdmin[0].designation || "",
        profileImage,
      };

      await updateProfileModel(token, updateData);

      if (new_password && new_password.trim() !== "") {
        if (new_password !== confirm_password) {
          req.setFlash("error", "Passwords do not match.");
          return res.redirect("/profile");
        }
        if (new_password.length < 6) {
          req.setFlash("error", "Password must be at least 6 characters.");
          return res.redirect("/profile");
        }
        const encrypted = customFunction.encrypt(new_password, key);
        await updatePasswordModel(token, encrypted);
      }

      req.setFlash("success", "Profile updated successfully!");
      return res.redirect("/profile");
    } catch (error) {
      console.error("postProfile error:", error);
      req.setFlash("error", "Something went wrong: " + error.message);
      return res.redirect("/profile");
    }
  },
};

module.exports = AuthController;
