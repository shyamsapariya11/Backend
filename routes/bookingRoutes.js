const express = require("express");
const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  updateMyBooking,
  cancelMyBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Customer
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.put("/my-bookings/:id", protect, updateMyBooking);
router.patch("/my-bookings/:id/cancel", protect, cancelMyBooking);

// Admin
router.get("/", protect, adminOnly, getAllBookings);
router.patch("/:id/status", protect, adminOnly, updateBookingStatus);
router.delete("/:id", protect, adminOnly, deleteBooking);

module.exports = router;