const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  createProject,
  assignDeveloper,
  getProjects,
  markCompleted,
  deleteProject,
  updateProject,
} = require("../controllers/project.controller");

// ADMIN
router.post("/", auth, role(["ADMIN"]), createProject);
router.patch("/:id/complete", auth, role(["ADMIN"]), markCompleted);
router.delete("/:id/delete", auth, role(["ADMIN"]), deleteProject);
router.patch("/:id/update", auth, role(["ADMIN"]), updateProject);


// LEAD
router.patch("/:id/assign", auth, role(["LEAD"]), assignDeveloper);

// ALL AUTH USERS
router.get("/", auth, getProjects);

module.exports = router;