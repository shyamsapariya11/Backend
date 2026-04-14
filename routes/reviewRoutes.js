const express = require("express");
const router = express.Router();

const {
  createReview,
  getAllReviews,
  getMyReviews,
  getReviewsByService,
  deleteReview,
} = require("../controllers/reviewController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getAllReviews);
router.get("/my-reviews", protect, getMyReviews);
router.get("/service/:serviceId", getReviewsByService);

router.post("/", protect, createReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;