const mongoose = require('mongoose');

const bagSchema = new mongoose.Schema(
  {
    weight: { type: String, required: true },
    destination: { type: String, required: true },
    card: { type: String, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bag', bagSchema);
