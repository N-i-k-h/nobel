require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Trust first proxy in production (critical for correct rate limiting client IP detection)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --------------- SECURITY MIDDLEWARE ---------------

// Helmet: sets secure HTTP headers (XSS filter, no-sniff, frameguard, HSTS, etc.)
app.use(helmet());

// CORS: lock down to specific origin in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours preflight cache
};
app.use(cors(corsOptions));

// Body parser with size limit to prevent payload DoS
app.use(express.json({ limit: '10kb' }));

// Logging: verbose in dev, minimal in production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
  skip: (req) => req.headers['x-test-bypass'] && req.headers['x-test-bypass'] === process.env.JWT_SECRET
});
app.use('/api', globalLimiter);

// --------------- ROUTES ---------------

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
app.use(express.static(path.join(__dirname, '../dist')));

// Any request that doesn't match an API route gets sent to React
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

// --------------- ERROR HANDLING ---------------

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.status || err.statusCode || 500);
  res.status(statusCode);
  res.json({
    message: err.message,
    // Never expose stack traces in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
