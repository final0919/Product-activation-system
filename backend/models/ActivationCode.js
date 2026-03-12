
const mongoose = require('mongoose');

const activationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  isUsed: {
    type: Boolean,
    default: false,
  },
});

const ActivationCode = mongoose.model('ActivationCode', activationCodeSchema);

module.exports = ActivationCode;
