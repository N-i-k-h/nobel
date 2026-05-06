require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/worklogs', require('./routes/worklogRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/bags', require('./routes/bagRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

const path = require('path');

// --- Serve React Frontend ---
// This allows the backend to host the frontend directly!
app.use(express.static(path.join(__dirname, '../dist')));

// Any request that doesn't match an API route gets sent to React
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

// Error Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
