const Service = require("../models/Service");

// CREATE SERVICE
exports.createService = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      estimatedTime,
      vehicleType,
      category,
      image,
    } = req.body;

    if (
      !title ||
      !description ||
      !price ||
      !estimatedTime ||
      !vehicleType ||
      !category
    ) {
      return res.status(400).json({
        message: "All required service fields must be filled",
      });
    }

    const service = await Service.create({
      title,
      description,
      price,
      estimatedTime,
      vehicleType,
      category,
      image: image || "",
    });

    const populatedService = await Service.findById(service._id).populate(
      "category",
      "name description"
    );

    res.status(201).json({
      message: "Service created successfully",
      service: populatedService,
    });
  } catch (error) {
    console.error("Create Service Error:", error.message);
    res.status(500).json({ message: "Server error while creating service" });
  }
};

// GET ALL SERVICES
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("category", "name description")
      .sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
    console.error("Get Services Error:", error.message);
    res.status(500).json({ message: "Server error while fetching services" });
  }
};

// GET SERVICE BY ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "category",
      "name description"
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Get Service By ID Error:", error.message);
    res.status(500).json({ message: "Server error while fetching service" });
  }
};

// UPDATE SERVICE
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const {
      title,
      description,
      price,
      estimatedTime,
      vehicleType,
      category,
      image,
      rating,
      popularity,
      isActive,
    } = req.body;

    service.title = title || service.title;
    service.description = description || service.description;
    service.price = price ?? service.price;
    service.estimatedTime = estimatedTime || service.estimatedTime;
    service.vehicleType = vehicleType || service.vehicleType;
    service.category = category || service.category;
    service.image = image ?? service.image;
    service.rating = rating ?? service.rating;
    service.popularity = popularity ?? service.popularity;
    service.isActive = isActive ?? service.isActive;

    await service.save();

    const updatedService = await Service.findById(service._id).populate(
      "category",
      "name description"
    );

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Update Service Error:", error.message);
    res.status(500).json({ message: "Server error while updating service" });
  }
};

// DELETE SERVICE
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await service.deleteOne();

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete Service Error:", error.message);
    res.status(500).json({ message: "Server error while deleting service" });
  }
};