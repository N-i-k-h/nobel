const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    cardNumber: { type: String, required: true, unique: true },
    partNo: { type: String },
    productName: { type: String },
    date: { type: String, required: true },
    processes: [
      {
        processName: { type: String, required: true },
        operator: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', cardSchema);
