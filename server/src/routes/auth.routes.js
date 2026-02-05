const express = require("express");
const router = express.Router();
const {
	login,
	register,
	refreshToken,
	logout,
	editUserRole,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Admin-only user creation
router.post("/register", auth, role(["ADMIN"]), register);

//Admin-only user editing role 
router.put("/edit-role", auth, role(["ADMIN"]), editUserRole);

// Login (all users)
router.post("/login", login);

// Refresh access token
router.post("/refresh", refreshToken);

// Logout
router.post("/logout", auth, logout);

module.exports = router;