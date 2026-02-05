const express = require("express");
const router = express.Router();
const {
	login,
	register,
	refreshToken,
	logout,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Admin-only user creation
router.post("/register", auth, role(["ADMIN"]), register);

// Login (all users)
router.post("/login", login);

// Refresh access token
router.post("/refresh", refreshToken);

// Logout
router.post("/logout", auth, logout);

module.exports = router;