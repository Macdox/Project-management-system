const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { getAllUsers } = require("../controllers/user.controller");

// ADMIN: get all users
router.get("/", auth, role(["ADMIN"]), getAllUsers);


module.exports = router;