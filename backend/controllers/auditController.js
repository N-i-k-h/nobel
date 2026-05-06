const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { date, operator, product } = req.query;
    let filter = {};

    // For date we might want to query timestamp or maybe actual data
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      filter.timestamp = { $gte: start, $lte: end };
    }
    
    if (operator) {
      // Operator needs to match user.name, but AuditLog only stores user _id
      // For a robust search, we can populate first or do a lookup. 
      // Simplified: we rely on front-end passing User ID if filtering by operator, or we just populate and filter
    }
    
    if (product) filter.product = product;

    const logs = await AuditLog.find(filter).populate('user', 'name').sort('-timestamp');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
