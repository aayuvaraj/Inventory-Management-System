const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 0 },
  manager: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Warehouse', schema);
