const WorkLog = require('../models/WorkLog');
const AuditLog = require('../models/AuditLog');

exports.createWorkLog = async (req, res) => {
  try {
    const { productionQty, frontRejection, rearRejection, ...rest } = req.body;
    const finalOutput = Number(productionQty) - (Number(frontRejection || 0) + Number(rearRejection || 0));

    const workLog = await WorkLog.create({
      ...rest,
      productionQty,
      frontRejection,
      rearRejection,
      finalOutput
    });

    // Create Audit Log
    await AuditLog.create({
      action: 'CREATE_WORK_LOG',
      user: req.user._id,
      role: req.user.role,
      product: req.body.product,
      shift: req.body.shift,
      timeSlot: req.body.timeSlot,
      newData: { productionQty, frontRejection, rearRejection, finalOutput }
    });

    res.status(201).json(workLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getWorkLogs = async (req, res) => {
  try {
    const workLogs = await WorkLog.find().populate('operator product assignment', 'name');
    res.json(workLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWorkLog = async (req, res) => {
  try {
    const oldLog = await WorkLog.findById(req.params.id);
    if (!oldLog) return res.status(404).json({ message: 'WorkLog not found' });

    const { productionQty, frontRejection, rearRejection, ...rest } = req.body;
    
    let updateData = { ...rest };
    if (productionQty !== undefined || frontRejection !== undefined || rearRejection !== undefined) {
      const pQty = productionQty !== undefined ? productionQty : oldLog.productionQty;
      const fRej = frontRejection !== undefined ? frontRejection : oldLog.frontRejection;
      const rRej = rearRejection !== undefined ? rearRejection : oldLog.rearRejection;
      
      updateData.productionQty = pQty;
      updateData.frontRejection = fRej;
      updateData.rearRejection = rRej;
      updateData.finalOutput = Number(pQty) - (Number(fRej) + Number(rRej));
    }

    const updatedLog = await WorkLog.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // Create Audit Log
    await AuditLog.create({
      action: 'EDIT_WORK_LOG',
      user: req.user._id,
      role: req.user.role,
      product: updatedLog.product,
      shift: updatedLog.shift,
      timeSlot: updatedLog.timeSlot,
      oldData: {
        productionQty: oldLog.productionQty,
        frontRejection: oldLog.frontRejection,
        rearRejection: oldLog.rearRejection,
        finalOutput: oldLog.finalOutput
      },
      newData: {
        productionQty: updatedLog.productionQty,
        frontRejection: updatedLog.frontRejection,
        rearRejection: updatedLog.rearRejection,
        finalOutput: updatedLog.finalOutput
      }
    });

    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
