const Bag = require('../models/Bag');

exports.createBag = async (req, res) => {
  try {
    const bag = await Bag.create(req.body);
    res.status(201).json(bag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBags = async (req, res) => {
  try {
    const bags = await Bag.find().populate('card', 'cardNumber partNo');
    res.json(bags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBag = async (req, res) => {
  try {
    const bag = await Bag.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBag = async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bag removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
