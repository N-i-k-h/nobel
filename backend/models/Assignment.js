const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    processes: [{ type: String }],
    shift: { type: String, enum: ['A', 'B'], required: true },
    timeSlot: { type: String, required: true },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cavity: { type: String },
    partNo: { type: String },
    machine: { type: String },
    counterStart: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
