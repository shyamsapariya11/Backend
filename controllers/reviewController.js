const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Service = require("../models/Service");

// CREATE REVIEW
exports.createReview = async (req, res) => {
  try {
    const { bookingId, serviceId, rating, comment } = req.body;

    if (!serviceId || !rating || !comment) {
      return res.status(400).json({
        message: "Service, rating and comment are required",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (booking.status !== "Completed") {
        return res.status(400).json({
          message: "Only completed bookings can be reviewed",
        });
      }
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      service: serviceId,
      booking: bookingId || null,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this service",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      service: service._id,
      booking: booking ? booking._id : null,
      userName: req.user.name,
      serviceName: service.title,
      rating: Number(rating),
      comment,
    });

    const reviews = await Review.find({ service: service._id });
    const avgRating =
      reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

    service.rating = Number(avgRating.toFixed(1));
    service.popularity = reviews.length;
    await service.save();

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("service", "title image");

    res.status(201).json({
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create Review Error:", error.message);
    res.status(500).json({ message: "Server error while submitting review" });
  }
};

// GET ALL REVIEWS
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("service", "title image")
      .populate("booking")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Get All Reviews Error:", error.message);
    res.status(500).json({ message: "Server error while fetching reviews" });
  }
};

// GET MY REVIEWS
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("user", "name email")
      .populate("service", "title image")
      .populate("booking")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Get My Reviews Error:", error.message);
    res.status(500).json({ message: "Server error while fetching your reviews" });
  }
};

// GET REVIEWS BY SERVICE
exports.getReviewsByService = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate("user", "name email")
      .populate("service", "title image")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Get Reviews By Service Error:", error.message);
    res.status(500).json({ message: "Server error while fetching service reviews" });
  }
};

// DELETE REVIEW
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const serviceId = review.service;

    await review.deleteOne();

    const service = await Service.findById(serviceId);
    if (service) {
      const reviews = await Review.find({ service: serviceId });

      if (reviews.length > 0) {
        const avgRating =
          reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
        service.rating = Number(avgRating.toFixed(1));
        service.popularity = reviews.length;
      } else {
        service.rating = 0;
        service.popularity = 0;
      }

      await service.save();
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete Review Error:", error.message);
    res.status(500).json({ message: "Server error while deleting review" });
  }
};