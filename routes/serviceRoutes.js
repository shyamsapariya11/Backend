const express = require("express");
const router = express.Router();

const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getAllServices);
router.get("/:id", getServiceById);

router.post("/", protect, adminOnly, createService);
router.put("/:id", protect, adminOnly, updateService);
router.delete("/:id", protect, adminOnly, deleteService);

module.exports = router;