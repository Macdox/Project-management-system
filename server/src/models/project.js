const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  deadline: Date,
  status: {
    type: String,
    enum: ["ACTIVE", "COMPLETED"],
    default: "ACTIVE",
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  developers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  documents: [
    {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Project", projectSchema);