const Card = require('../models/Card');

exports.createCard = async (req, res) => {
  try {
    // Generate random Card Number (e.g., C-12345)
    const cardNumber = 'C-' + Math.floor(10000 + Math.random() * 90000);
    const card = await Card.create({ ...req.body, cardNumber });
    res.status(201).json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: 'Card removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
