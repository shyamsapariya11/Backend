const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    servicePrice: {
      type: Number,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ["Car", "Bike", "Scooter", "SUV", "Truck"],
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
    bookingDate: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);