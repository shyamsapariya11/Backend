const Category = require("../models/Category");

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ name: name.trim() });

    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error.message);
    res.status(500).json({ message: "Server error while creating category" });
  }
};

// GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get Categories Error:", error.message);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
};

// GET CATEGORY BY ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Get Category By ID Error:", error.message);
    res.status(500).json({ message: "Server error while fetching category" });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name || category.name;
    category.description = description ?? category.description;

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error.message);
    res.status(500).json({ message: "Server error while updating category" });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error.message);
    res.status(500).json({ message: "Server error while deleting category" });
  }
};