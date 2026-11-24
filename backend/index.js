const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const integrationRoutes = require("./routes/integrationRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const protect = require("./middleware/authMiddleware");

const warehouseRoutes = require('./routes/warehouseRoutes');
const orderRoutes = require('./routes/orderRoutes');
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json());
app.use("/api/suppliers", protect, supplierRoutes);
app.use('/api/warehouses', protect, warehouseRoutes);
app.use('/api/orders', protect, orderRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Inventory Management System Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/integrations", integrationRoutes);

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing. Add it to backend/.env");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add it to backend/.env");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
