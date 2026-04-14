const Query = require("../models/Query");

// CREATE QUERY
exports.createQuery = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        message: "Subject and message are required",
      });
    }

    const query = await Query.create({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      subject,
      message,
      status: "Open",
    });

    const populatedQuery = await Query.findById(query._id).populate(
      "user",
      "name email"
    );

    res.status(201).json({
      message: "Query submitted successfully",
      query: populatedQuery,
    });
  } catch (error) {
    console.error("Create Query Error:", error.message);
    res.status(500).json({ message: "Server error while submitting query" });
  }
};

// GET MY QUERIES
exports.getMyQueries = async (req, res) => {
  try {
    const queries = await Query.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(queries);
  } catch (error) {
    console.error("Get My Queries Error:", error.message);
    res.status(500).json({ message: "Server error while fetching your queries" });
  }
};

// GET ALL QUERIES
exports.getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(queries);
  } catch (error) {
    console.error("Get All Queries Error:", error.message);
    res.status(500).json({ message: "Server error while fetching all queries" });
  }
};

// GET QUERY BY ID
exports.getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id).populate(
      "user",
      "name email role"
    );

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    const isOwner = query.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(query);
  } catch (error) {
    console.error("Get Query By ID Error:", error.message);
    res.status(500).json({ message: "Server error while fetching query" });
  }
};

// REPLY TO QUERY - ADMIN
exports.replyToQuery = async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({
        message: "Reply message is required",
      });
    }

    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    query.reply = reply;
    query.status = "Resolved";

    await query.save();

    const updatedQuery = await Query.findById(query._id).populate(
      "user",
      "name email role"
    );

    res.status(200).json({
      message: "Reply sent successfully",
      query: updatedQuery,
    });
  } catch (error) {
    console.error("Reply To Query Error:", error.message);
    res.status(500).json({ message: "Server error while replying to query" });
  }
};

// DELETE QUERY
exports.deleteQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    const isOwner = query.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    await query.deleteOne();

    res.status(200).json({ message: "Query deleted successfully" });
  } catch (error) {
    console.error("Delete Query Error:", error.message);
    res.status(500).json({ message: "Server error while deleting query" });
  }
};