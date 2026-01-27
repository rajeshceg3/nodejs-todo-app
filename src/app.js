const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api.routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/list', limiter);
app.use('/audit-logs', limiter);

app.use(bodyParser.json());

// API Routes
app.use('/', apiRoutes);

// Serve Angular static files
app.use(express.static(path.join(__dirname, '../angular-ui/dist/angular-ui/browser')));
app.use('/static', express.static(path.join(__dirname, '../static')));

// Catch-all for Angular
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/list') || req.path.startsWith('/audit-logs')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../angular-ui/dist/angular-ui/browser/index.html'));
});

module.exports = app;
