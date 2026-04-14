const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const generateInvoice = (paymentData) => {
  return new Promise((resolve, reject) => {
    const invoicesDir = path.join(__dirname, "..", "invoices");

    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const fileName = `${paymentData.invoiceNumber}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(22).text("E-Garage Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice Number: ${paymentData.invoiceNumber}`);
    doc.text(`Payment ID: ${paymentData.razorpayPaymentId}`);
    doc.text(`Order ID: ${paymentData.razorpayOrderId}`);
    doc.text(`Date: ${new Date(paymentData.paidAt).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text("Customer Details", { underline: true });
    doc.fontSize(12).text(`Name: ${paymentData.customerName}`);
    doc.text(`Email: ${paymentData.customerEmail}`);
    doc.text(`Phone: ${paymentData.customerPhone}`);
    doc.moveDown();

    doc.fontSize(14).text("Service Details", { underline: true });
    doc.fontSize(12).text(`Service: ${paymentData.serviceName}`);
    doc.text(`Vehicle Type: ${paymentData.vehicleType || "N/A"}`);
    doc.moveDown();

    doc.fontSize(14).text("Payment Summary", { underline: true });
    doc.fontSize(12).text(`Amount Paid: ₹${paymentData.amount}`);
    doc.text(`Currency: ${paymentData.currency}`);
    doc.text(`Payment Status: ${paymentData.status}`);
    doc.moveDown();

    doc.text("Thank you for choosing E-Garage!", { align: "center" });

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", (err) => reject(err));
  });
};

module.exports = generateInvoice;