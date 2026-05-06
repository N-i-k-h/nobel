const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, enum: ['CREATE_WORK_LOG', 'EDIT_WORK_LOG'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    product: { type: String, required: true },
    shift: { type: String, required: true },
    timeSlot: { type: String, required: true },
    oldData: { type: Object, default: null },
    newData: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
