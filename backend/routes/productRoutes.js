const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/product");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Every product endpoint requires a valid JWT.
router.use(protect);

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch products." });
  }
});

// Add a product
router.post("/", async (req, res) => {
  try {
    const { name, category, quantity, price, supplier } = req.body;
    const product = await Product.create({ name, category, quantity, price, supplier });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not add product." });
  }
});

// Update a product
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const { name, category, quantity, price, supplier } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, quantity, price, supplier },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not update product." });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete product." });
  }
});

module.exports = router;
