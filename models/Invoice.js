const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleName: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);