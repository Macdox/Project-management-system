const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
// const userRoutes = require("./routes/user.routes");

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
// app.use("/api/users", userRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});