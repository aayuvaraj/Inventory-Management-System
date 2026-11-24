
const express = require("express");
const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");

const router = express.Router();

// GET - View all suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    console.error("Get suppliers error:", error);
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
});

// POST - Add new supplier
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
      status
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error("Create supplier error:", error);
    res.status(500).json({ message: "Failed to create supplier" });
  }
});

// PUT - Update supplier
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid supplier ID" });
    }

    const allowed = ["name", "email", "phone", "address", "status"];
    const updates = {};

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    console.error("Update supplier error:", error);
    res.status(500).json({ message: "Failed to update supplier" });
  }
});

// DELETE - Remove supplier
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid supplier ID" });
    }

    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Delete supplier error:", error);
    res.status(500).json({ message: "Failed to delete supplier" });
  }
});

module.exports = router;
