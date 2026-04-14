const express = require("express");
const router = express.Router();

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyPayments,
  getAllPayments,
  getPaymentById,
} = require("../controllers/paymentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

router.get("/my-payments", protect, getMyPayments);
router.get("/:id", protect, getPaymentById);
router.get("/", protect, adminOnly, getAllPayments);

module.exports = router;