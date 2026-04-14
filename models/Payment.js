const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      default: "Razorpay",
    },
    payerName: {
      type: String,
      required: true,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Failed", "Pending"],
      default: "Pending",
    },
    transactionId: {
      type: String,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);