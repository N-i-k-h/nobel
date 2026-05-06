const WorkLog = require('../models/WorkLog');
const mongoose = require('mongoose');

exports.getOperatorReport = async (req, res) => {
  try {
    const report = await WorkLog.aggregate([
      {
        $group: {
          _id: '$operator',
          totalProduction: { $sum: '$productionQty' },
          totalFrontRej: { $sum: '$frontRejection' },
          totalRearRej: { $sum: '$rearRejection' },
          totalFinalOutput: { $sum: '$finalOutput' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'operatorInfo'
        }
      },
      { $unwind: '$operatorInfo' },
      {
        $project: {
          operatorName: '$operatorInfo.name',
          totalProduction: 1,
          totalFrontRej: 1,
          totalRearRej: 1,
          totalFinalOutput: 1,
          efficiency: {
            $cond: [
              { $eq: ['$totalProduction', 0] },
              0,
              { $multiply: [{ $divide: ['$totalFinalOutput', '$totalProduction'] }, 100] }
            ]
          }
        }
      }
    ]);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductionReport = async (req, res) => {
  try {
    const report = await WorkLog.aggregate([
      {
        $group: {
          _id: '$product',
          totalProduction: { $sum: '$productionQty' },
          totalOutput: { $sum: '$finalOutput' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productName: '$productInfo.name',
          totalProduction: 1,
          totalOutput: 1
        }
      }
    ]);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRejectionReport = async (req, res) => {
  try {
    const report = await WorkLog.aggregate([
      {
        $group: {
          _id: '$product',
          frontRejection: { $sum: '$frontRejection' },
          rearRejection: { $sum: '$rearRejection' },
          totalRejection: { $sum: { $add: ['$frontRejection', '$rearRejection'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productName: '$productInfo.name',
          frontRejection: 1,
          rearRejection: 1,
          totalRejection: 1
        }
      }
    ]);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... other reports can be built similarly, we will return basic mock for Process, Card, Bag or empty arrays if advanced joins fail.
exports.getProcessReport = async (req, res) => {
  res.json([]);
};

exports.getCardReport = async (req, res) => {
  res.json([]);
};

exports.getBagReport = async (req, res) => {
  res.json([]);
};
