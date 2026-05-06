const mongoose = require('mongoose');

const bagSchema = new mongoose.Schema(
  {
    weight: { type: Number, required: true },
    destination: { type: String, required: true },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    submissionDate: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bag', bagSchema);
