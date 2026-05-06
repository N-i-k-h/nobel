const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    date: { type: String, required: true },
    shift: { type: String, enum: ['A', 'B'], required: true },
    timeSlot: { type: String, required: true },
    productionQty: { type: Number, required: true, default: 0 },
    frontRejection: { type: Number, default: 0 },
    rearRejection: { type: Number, default: 0 },
    finalOutput: { type: Number, required: true, default: 0 },
    counterEnd: { type: Number, default: 0 },
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkLog', workLogSchema);
