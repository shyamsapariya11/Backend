const express = require("express");
const router = express.Router();

const {
  createQuery,
  getMyQueries,
  getAllQueries,
  getQueryById,
  replyToQuery,
  deleteQuery,
} = require("../controllers/queryController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createQuery);
router.get("/my-queries", protect, getMyQueries);
router.get("/:id", protect, getQueryById);
router.delete("/:id", protect, deleteQuery);

router.get("/", protect, adminOnly, getAllQueries);
router.patch("/:id/reply", protect, adminOnly, replyToQuery);

module.exports = router;