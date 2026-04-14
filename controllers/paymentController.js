const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

const generateInvoiceNumber = () => {
  return "INV" + Date.now() + Math.floor(Math.random() * 1000);
};

// CREATE ORDER
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId, payerName } = req.body;

    if (!bookingId || !payerName) {
      return res.status(400).json({
        message: "Booking ID and payer name are required",
      });
    }

    const booking = await Booking.findById(bookingId).populate("user service");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.status !== "Completed") {
      return res.status(400).json({
        message: "Payment allowed only for completed bookings",
      });
    }

    const existingPayment = await Payment.findOne({
      booking: booking._id,
      paymentStatus: "Paid",
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already completed for this booking",
      });
    }

    // Razorpay amount must be in paise
    const options = {
      amount: Number(booking.servicePrice) * 100,
      currency: "INR",
      receipt: `receipt_${booking._id}`,
      notes: {
        bookingId: String(booking._id),
        userId: String(req.user._id),
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(201).json({
      message: "Razorpay order created successfully",
      order,
      booking: {
        id: booking._id,
        serviceName: booking.serviceName,
        amount: booking.servicePrice,
        userName: booking.userName,
        email: booking.email,
        contact: booking.contact,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error.message);
    return res.status(500).json({
      message: "Server error while creating Razorpay order",
    });
  }
};

// VERIFY PAYMENT
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      bookingId,
      payerName,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !bookingId ||
      !payerName ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing payment verification fields",
      });
    }

    const booking = await Booking.findById(bookingId).populate("user service");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // IMPORTANT: verify using order_id from server-side flow
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const existingPayment = await Payment.findOne({
      booking: booking._id,
      paymentStatus: "Paid",
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already saved for this booking",
      });
    }

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.servicePrice,
      method: "Razorpay",
      payerName,
      paymentStatus: "Paid",
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    const invoice = await Invoice.create({
      booking: booking._id,
      payment: payment._id,
      user: req.user._id,
      invoiceNumber: generateInvoiceNumber(),
      customerName: booking.userName,
      customerEmail: booking.email,
      serviceName: booking.serviceName,
      vehicleName: booking.vehicleName,
      vehicleNumber: booking.vehicleNumber,
      paymentMethod: "Razorpay",
      amount: booking.servicePrice,
    });

    return res.status(201).json({
      message: "Payment verified successfully",
      payment,
      invoiceId: invoice._id,
    });
  } catch (error) {
    console.error("Verify Razorpay Payment Error:", error.message);
    return res.status(500).json({
      message: "Server error while verifying payment",
    });
  }
};

// GET MY PAYMENTS
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("booking")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get My Payments Error:", error.message);
    res.status(500).json({ message: "Server error while fetching payments" });
  }
};

// GET ALL PAYMENTS - ADMIN
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("booking")
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get All Payments Error:", error.message);
    res.status(500).json({ message: "Server error while fetching all payments" });
  }
};

// GET PAYMENT BY ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("booking")
      .populate("user", "name email role");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const isOwner = payment.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Get Payment By ID Error:", error.message);
    res.status(500).json({ message: "Server error while fetching payment" });
  }
};