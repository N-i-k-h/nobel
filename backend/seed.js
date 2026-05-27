const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const seedAdmin = async () => {
  await connectDB();
  
  const email = process.env.ADMIN_EMAIL || 'admin@nobel.com';
  const userExists = await User.findOne({ email: email.toLowerCase().trim() });
  if (userExists) {
    console.log(`Admin user with email ${email} already exists.`);
    process.exit();
  }

  const saltRounds = 12; // High standard for production hashing
  const salt = await bcrypt.genSalt(saltRounds);
  
  let password = process.env.ADMIN_INITIAL_PASSWORD;
  let isGenerated = false;
  if (!password) {
    password = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    isGenerated = true;
  }
  
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    name: 'Super Admin',
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: 'admin'
  });

  console.log(`Admin seeded successfully with email: ${email}`);
  if (isGenerated) {
    console.log(`Generated secure password: ${password}`);
    console.log('WARNING: Store this password securely. It will not be shown again.');
  } else {
    console.log('Password set from ADMIN_INITIAL_PASSWORD environment variable.');
  }
  process.exit();
};

seedAdmin();
