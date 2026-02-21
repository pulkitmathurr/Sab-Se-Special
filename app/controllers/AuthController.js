const { key } = require("../config/config");
const customFunction = require("../middleware/customFunction");
const { getAdminData, insertLoginHistory } = require("../models/authModel");

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
      //const { email, password } = req.body.trim();
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
};

module.exports = AuthController;