const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  supplierName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['Pending','Ordered','Received','Cancelled'], default: 'Pending' },
  notes: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('PurchaseOrder', schema);
