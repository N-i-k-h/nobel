const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema(
  {
    assignment: { type: String },
    operator: { type: String, required: true },
    product: { type: String, required: true },
    date: { type: String, required: true },
    shift: { type: String, required: true },
    timeSlot: { type: String, required: true },
    qty: { type: Number, required: true, default: 0 },
    frontRejection: { type: Number, default: 0 },
    rearRejection: { type: Number, default: 0 },
    finalOutput: { type: Number, required: true, default: 0 },
    counterEnd: { type: Number, default: 0 },
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkLog', workLogSchema);
