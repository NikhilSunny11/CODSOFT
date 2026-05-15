const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
// Custom NoSQL injection sanitizer (Express 5 compatible)
// express-mongo-sanitize v2 is incompatible with Express 5 because
// req.query is a read-only getter in Express 5. This inline sanitizer
// uses Object.defineProperty to make req.query writable, then strips
// dangerous MongoDB operators ($ and .) from body, params, and query.
const sanitize = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'string' && obj[key].includes('$')) {
        obj[key] = obj[key].replace(/\$/g, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  }
  return obj;
};

const mongoSanitize = () => (req, _res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  // Express 5: req.query is a frozen getter — replace it with a
  // mutable shallow copy so we can strip dangerous keys safely.
  try {
    const q = { ...req.query };
    sanitize(q);
    Object.defineProperty(req, 'query', {
      value: q,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch { /* ignore if query can't be redefined */ }
  next();
};
require('dotenv').config();

const connectDB = require('./config/db');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import route files
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const savedJobRoutes = require('./routes/savedJobs');
const companyRoutes = require('./routes/company');

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false, // Allow cross-origin images (Cloudinary)
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',   // Cloudinary images (logos)
          'https://codsoft-x4s0.onrender.com',          // Backend profile images
          'https://codsoft-rho-nine.vercel.app',
        ],
        connectSrc: [
          "'self'",
          'https://codsoft-x4s0.onrender.com',
          'https://codsoft-rho-nine.vercel.app',
        ],
      },
    },
  })
);

const allowedOrigins = [
  'https://codsoft-rho-nine.vercel.app',
  'http://localhost:5173',
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ─── Rate Limiting ──────────────────────────────────────────────────────
// Apply general rate limiter to all /api routes
app.use('/api', apiLimiter);

// Apply stricter rate limiter to auth endpoints (login, register, forgot-password)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ─── Body Parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── NoSQL Injection Sanitization ───────────────────────────────────────
// Removes $ and . from req.body, req.query, and req.params
app.use(mongoSanitize());

// ─── Static Files (for locally stored resumes / profile images) ─────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/company', companyRoutes);

// ─── Health Check ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.',
    });
  }

  // Multer file type error (logo or resume)
  if (err.message && (err.message.includes('Only PDF') || err.message.includes('Only JPG'))) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ─── Start Server ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
};

startServer();
