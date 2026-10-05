import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for learning & debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Simple structured log format useful for DevOps logging
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Serve frontend static assets from public/
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// API routes
app.use('/api', apiRoutes);

// Fallback for API routes 404
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requestedPath: req.originalUrl,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/info',
      'GET /api/items',
      'POST /api/items',
      'DELETE /api/items/:id'
    ]
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server'
  });
});

export default app;
