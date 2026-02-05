const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  createProject,
  assignDeveloper,
  getProjects,
  markCompleted,
} = require("../controllers/project.controller");

// ADMIN
router.post("/", auth, role(["ADMIN"]), createProject);
router.patch("/:id/complete", auth, role(["ADMIN"]), markCompleted);

// LEAD
router.patch("/:id/assign", auth, role(["LEAD"]), assignDeveloper);

// ALL AUTH USERS
router.get("/", auth, getProjects);

module.exports = router;