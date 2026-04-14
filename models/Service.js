const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatedTime: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ["Car", "Bike", "Scooter", "SUV", "Truck"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);