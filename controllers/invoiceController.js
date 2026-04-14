const Invoice = require("../models/Invoice");
const PDFDocument = require("pdfkit");

exports.getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .populate("booking")
      .populate("payment")
      .sort({ createdAt: -1 });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Get My Invoices Error:", error.message);
    res.status(500).json({ message: "Server error while fetching invoices" });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("booking")
      .populate("payment")
      .populate("user", "name email role");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const isOwner = invoice.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Get Invoice By ID Error:", error.message);
    res.status(500).json({ message: "Server error while fetching invoice" });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("booking")
      .populate("payment")
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Get All Invoices Error:", error.message);
    res.status(500).json({ message: "Server error while fetching all invoices" });
  }
};

exports.downloadInvoicePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("booking")
      .populate("payment")
      .populate("user", "name email role");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const isOwner = invoice.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const fileName = `invoice-${invoice.invoiceNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    doc.pipe(res);

    doc.fontSize(24).text("E-Garage Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Customer: ${invoice.customerName}`);
    doc.text(`Service: ${invoice.serviceName}`);
    doc.text(`Amount: ₹${invoice.amount}`);
    doc.text(`Payment Method: ${invoice.paymentMethod}`);
    doc.end();
  } catch (error) {
    console.error("Download Invoice PDF Error:", error.message);
    res.status(500).json({ message: "Server error while generating PDF" });
  }
};