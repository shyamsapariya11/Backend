const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    reply: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Open", "Resolved"],
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Query", querySchema);