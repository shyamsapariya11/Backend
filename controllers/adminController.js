const User = require("../models/User");
const Category = require("../models/Category");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Query = require("../models/Query");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCategories,
      totalServices,
      totalBookings,
      totalPayments,
      totalReviews,
      totalQueries,
      completedBookings,
      pendingBookings,
      inProgressBookings,
      cancelledBookings,
      latestBookings,
      latestReviews,
      latestQueries,
      payments,
    ] = await Promise.all([
      User.countDocuments(),
      Category.countDocuments(),
      Service.countDocuments(),
      Booking.countDocuments(),
      Payment.countDocuments(),
      Review.countDocuments(),
      Query.countDocuments(),
      Booking.countDocuments({ status: "Completed" }),
      Booking.countDocuments({ status: "Pending" }),
      Booking.countDocuments({ status: "In Progress" }),
      Booking.countDocuments({ status: "Cancelled" }),
      Booking.find()
        .populate("user", "name email")
        .populate("service", "title image")
        .sort({ createdAt: -1 })
        .limit(5),
      Review.find()
        .populate("user", "name email")
        .populate("service", "title")
        .sort({ createdAt: -1 })
        .limit(5),
      Query.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
      Payment.find(),
    ]);

    const totalRevenue = payments.reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      totalUsers,
      totalCategories,
      totalServices,
      totalBookings,
      totalPayments,
      totalReviews,
      totalQueries,
      completedBookings,
      pendingBookings,
      inProgressBookings,
      cancelledBookings,
      totalRevenue,
      latestBookings,
      latestReviews,
      latestQueries,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error.message);
    res.status(500).json({
      message: "Server error while fetching dashboard stats",
    });
  }
};