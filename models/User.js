const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpire: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpire: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);