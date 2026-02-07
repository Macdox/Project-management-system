const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const upload = require("../middleware/upload");

// Accept form field name "document" (preferred) and fall back to "file" to avoid Unexpected field errors
const singleDocUpload = (req, res, next) => {
  upload.single("document")(req, res, (err) => {
    if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
      return upload.single("file")(req, res, next);
    }
    return next(err);
  });
};

const {
  createProject,
  assignDeveloper,
  getProjects,
  markCompleted,
  deleteProject,
  updateProject,
  uploadDocument,
} = require("../controllers/project.controller");

// ADMIN
router.post("/", auth, role(["ADMIN"]), createProject);
router.patch("/:id/complete", auth, role(["ADMIN"]), markCompleted);
router.delete("/:id/delete", auth, role(["ADMIN"]), deleteProject);
router.patch("/:id/update", auth, role(["ADMIN"]), updateProject);


// LEAD
router.patch("/:id/assign", auth, role(["LEAD"]), assignDeveloper);

// ALL AUTH USERS
router.post("/:id/documents", auth, role(["LEAD","ADMIN"]), singleDocUpload, uploadDocument);
router.get("/", auth, getProjects);

module.exports = router;