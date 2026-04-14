const Booking = require("../models/Booking");
const Service = require("../models/Service");

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const {
      service,
      userName,
      email,
      contact,
      vehicleType,
      vehicleName,
      vehicleNumber,
      bookingDate,
      timeSlot,
      notes,
    } = req.body;

    if (
      !service ||
      !userName ||
      !email ||
      !contact ||
      !vehicleType ||
      !vehicleName ||
      !vehicleNumber ||
      !bookingDate ||
      !timeSlot
    ) {
      return res.status(400).json({
        message: "All required booking fields must be filled",
      });
    }

    const serviceData = await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({ message: "Service not found" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceData._id,
      serviceName: serviceData.title,
      servicePrice: serviceData.price,
      userName,
      email,
      contact,
      vehicleType,
      vehicleName,
      vehicleNumber,
      bookingDate,
      timeSlot,
      notes: notes || "",
      status: "Pending",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email role")
      .populate("service", "title price image category vehicleType");

    res.status(201).json({
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error.message);
    res.status(500).json({ message: "Server error while creating booking" });
  }
};

// GET ALL BOOKINGS - ADMIN
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email role")
      .populate("service", "title price image vehicleType")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get All Bookings Error:", error.message);
    res.status(500).json({ message: "Server error while fetching bookings" });
  }
};

// GET MY BOOKINGS - CUSTOMER
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("user", "name email role")
      .populate("service", "title price image vehicleType")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get My Bookings Error:", error.message);
    res.status(500).json({ message: "Server error while fetching your bookings" });
  }
};

// GET BOOKING BY ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email role")
      .populate("service", "title price image vehicleType description");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Get Booking By ID Error:", error.message);
    res.status(500).json({ message: "Server error while fetching booking details" });
  }
};

// UPDATE BOOKING STATUS - ADMIN
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "In Progress",
      "Completed",
      "Cancelled",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Valid booking status is required",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email role")
      .populate("service", "title price image vehicleType");

    res.status(200).json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error.message);
    res.status(500).json({ message: "Server error while updating booking status" });
  }
};

// UPDATE BOOKING - CUSTOMER BEFORE PROCESSING
exports.updateMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending bookings can be updated",
      });
    }

    const {
      userName,
      email,
      contact,
      vehicleType,
      vehicleName,
      vehicleNumber,
      bookingDate,
      timeSlot,
      notes,
    } = req.body;

    booking.userName = userName || booking.userName;
    booking.email = email || booking.email;
    booking.contact = contact || booking.contact;
    booking.vehicleType = vehicleType || booking.vehicleType;
    booking.vehicleName = vehicleName || booking.vehicleName;
    booking.vehicleNumber = vehicleNumber || booking.vehicleNumber;
    booking.bookingDate = bookingDate || booking.bookingDate;
    booking.timeSlot = timeSlot || booking.timeSlot;
    booking.notes = notes ?? booking.notes;

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email role")
      .populate("service", "title price image vehicleType");

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update My Booking Error:", error.message);
    res.status(500).json({ message: "Server error while updating booking" });
  }
};

// CANCEL BOOKING - CUSTOMER
exports.cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({
        message: "Completed booking cannot be cancelled",
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error.message);
    res.status(500).json({ message: "Server error while cancelling booking" });
  }
};

// DELETE BOOKING - ADMIN
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();

    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete Booking Error:", error.message);
    res.status(500).json({ message: "Server error while deleting booking" });
  }
};