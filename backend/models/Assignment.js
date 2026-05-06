const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    product: { type: String, required: true },
    process: { type: String },
    shift: { type: String, required: true },
    timeSlot: { type: String, required: true },
    operator: { type: String, required: true },
    cavity: { type: String },
    partNo: { type: String },
    machine: { type: String },
    counterStart: { type: Number, default: 0 },
    createdBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
