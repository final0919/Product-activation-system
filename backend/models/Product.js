
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  requiresActivation: {
    type: Boolean,
    default: true, // 默认需要激活
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;