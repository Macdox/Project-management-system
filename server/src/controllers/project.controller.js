const Project = require("../models/project");
const user = require("../models/user");

// ADMIN: create project
exports.createProject = async (req, res) => {
  const { name, description, deadline, leadEmail } = req.body;

  const leadId = await user.findOne({ email: leadEmail }).then(u => u._id);
  
  if(!leadId) {
    return res.status(400).json({ message: "Lead not found" });
  }

  const project = await Project.create({
    name,
    description,
    deadline,
    lead: leadId,
  });

  res.status(201).json(project);
};

// ADMIN: delete project
exports.deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
};

// ADMIN: UPDATE project
exports.updateProject = async (req, res) => {
  const { name, description, deadline } = req.body;

  const project = await Project.findById(req.params.id);
  if(!project) return res.status(404).json({ message: "Project not found" });
  if (project.lead.toString() !== req.user.id)
    return res.status(403).json({ message: "Not project lead" });
  if(project.status === "COMPLETED") return res.status(400).json({ message: "Cannot update completed projects" });

  project.name = name || project.name;
  project.description = description || project.description;
  project.deadline = deadline || project.deadline;
  await project.save();

  res.json(project);
};

// ADMIN: mark completed
exports.markCompleted = async (req, res) => {
  await Project.findByIdAndUpdate(req.params.id, {
    status: "COMPLETED",
  });
  res.json({ message: "Project marked completed" });
};

// LEAD: assign developer
exports.assignDeveloper = async (req, res) => {
  const { developerEmail } = req.body;
  const developer = await user.findOne({ email: developerEmail }).then(u => u._id);
  if (!developer) return res.status(404).json({ message: "Developer not found" });
  
  const project = await Project.findById(req.params.id);

  if (project.lead.toString() !== req.user.id)
    return res.status(403).json({ message: "Not project lead" });

  if(project.status === "COMPLETED") return res.status(400).json({ message: "Cannot assign developers to completed projects" });
  
  project.developers.push(developer);
  await project.save();

  res.json({ message: "Developer assigned" });
};

// ALL: view projects
exports.getProjects = async (req, res) => {
  let filter = {};

  if (req.user.role === "LEAD") {
    filter = { lead: req.user.id };
  }

  if (req.user.role === "DEVELOPER") {
    filter = { developers: req.user.id };
  }

  const projects = await Project.find(filter).populate("lead developers");
  res.json(projects);
};