const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const seedAdmin = async () => {
  await connectDB();
  
  const userExists = await User.findOne({ email: 'admin@nobel.com' });
  if (userExists) {
    console.log('Admin already exists');
    process.exit();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  await User.create({
    name: 'Super Admin',
    email: 'admin@nobel.com',
    password: hashedPassword,
    role: 'admin'
  });

  console.log('Admin seeded successfully: admin@nobel.com / admin123');
  process.exit();
};

seedAdmin();
