const nodemailer = require("nodemailer");
const Project = require("../models/project");
const user = require("../models/user");

let mailer;
const getMailer = () => {
  if (mailer) return mailer;

  const { EMAIL_ADDRESS, EMAIL_PASSWORD } = process.env;

  if (!EMAIL_ADDRESS || !EMAIL_PASSWORD) return null;

  mailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_ADDRESS, pass: EMAIL_PASSWORD },
  });

  return mailer;
};

const sendAssignmentEmail = async ({ to, projectName }) => {
  const transporter = getMailer();
  if (!transporter) return;
  const fromAddress = process.env.EMAIL_ADDRESS;
  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Assigned to project: ${projectName}`,
      text: `You have been assigned to project "${projectName}". Please log in to view details and next steps.`,
    });
  } catch (err) {
    console.error("Mail send failed", err.message);
  }
};

// ADMIN: create project
exports.createProject = async (req, res) => {
  const { name, description, deadline, leadEmail } = req.body;
  console.log("Creating project with lead email:", leadEmail);

  const leadId = await user.findOne({ email: leadEmail }).then((u) => u._id);

  if (!leadId) {
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
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.lead.toString() !== req.user.id)
    return res.status(403).json({ message: "Not project lead" });
  if (project.status === "COMPLETED")
    return res
      .status(400)
      .json({ message: "Cannot update completed projects" });

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
  const developer = await user.findOne({ email: developerEmail });
  if (!developer)
    return res.status(404).json({ message: "Developer not found" });

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  if (project.lead.toString() !== req.user.id)
    return res.status(403).json({ message: "Not project lead" });

  if (project.status === "COMPLETED")
    return res
      .status(400)
      .json({ message: "Cannot assign developers to completed projects" });

  const alreadyAssigned = project.developers.some(
    (devId) => devId.toString() === developer._id.toString(),
  );
  if (alreadyAssigned) {
    return res.status(200).json({ message: "Developer already assigned" });
  }

  project.developers.push(developer._id);
  await project.save();

  sendAssignmentEmail({ to: developer.email, projectName: project.name });

  res.json({ message: "Developer assigned" });
};

// AUTH: upload project document
exports.uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const isAdmin = req.user.role === "ADMIN";
  const isLead = project.lead && project.lead.toString() === req.user.id;
  const isDeveloper = req.user.role === "DEVELOPER";
  const assignedToDev = project.developers.some((devId) => devId.toString() === req.user.id);

  if (!isAdmin && !isLead && !(isDeveloper && assignedToDev)) {
    return res
      .status(403)
      .json({ message: "Not allowed to upload to this project" });
  }

  project.documents.push({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user.id,
  });

  await project.save();

  const savedFile = project.documents[project.documents.length - 1];

  res.status(201).json({ message: "Document uploaded", file: savedFile });
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
