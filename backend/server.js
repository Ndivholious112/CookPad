const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

const path = require('path');
// CORS configuration
// Use dynamic origin reflection so it works on localhost and Vercel domains
const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Static file serving for uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cookpad';
mongoose.connect(mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('[OK] MongoDB connected successfully'))
.catch(err => {
  console.error('[ERR] MongoDB connection error:', err);
  // Don't exit the process, let the app run with mock data fallback
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
      message: 'CookPad Backend API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        recipes: '/api/recipes',
        health: '/health'
      }
    });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /',
      'GET /api/recipes',
      'GET /api/recipes/:id',
      'POST /api/recipes',
      'PUT /api/recipes/:id',
      'DELETE /api/recipes/:id'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server only when running this file directly (e.g., local dev)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[START] Server running on http://localhost:${PORT}`);
    console.log(`[INFO] API base at http://localhost:${PORT}`);
    console.log(`[INFO] Recipe endpoints: http://localhost:${PORT}/api/recipes`);
  });
}

// Export the app for serverless platforms (e.g., Vercel)
module.exports = app;
