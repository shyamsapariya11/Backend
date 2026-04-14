const express = require("express");
const router = express.Router();

const {
  getMyInvoices,
  getInvoiceById,
  getAllInvoices,
  downloadInvoicePdf,
} = require("../controllers/invoiceController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/my-invoices", protect, getMyInvoices);
router.get("/download/:id", protect, downloadInvoicePdf);
router.get("/:id", protect, getInvoiceById);
router.get("/", protect, adminOnly, getAllInvoices);

module.exports = router;