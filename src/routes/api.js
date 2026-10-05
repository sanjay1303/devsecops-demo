import { Router } from 'express';
import os from 'os';

const router = Router();

// In-memory data store for demonstration
let items = [
  { id: 1, title: 'Learn Node.js fundamentals', category: 'Backend', completed: true, createdAt: new Date().toISOString() },
  { id: 2, title: 'Build RESTful API endpoints', category: 'Backend', completed: true, createdAt: new Date().toISOString() },
  { id: 3, title: 'Write automated unit tests', category: 'Testing', completed: false, createdAt: new Date().toISOString() },
  { id: 4, title: 'Containerize application with Docker', category: 'DevOps', completed: false, createdAt: new Date().toISOString() },
  { id: 5, title: 'Configure CI/CD GitHub Actions', category: 'DevOps', completed: false, createdAt: new Date().toISOString() }
];

let nextId = 6;

/**
 * @route GET /api/health
 * @desc Standard DevOps health check endpoint for liveness/readiness probes
 */
router.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'UP',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    system: {
      platform: os.platform(),
      release: os.release(),
      freeMemMB: Math.round(os.freemem() / (1024 * 1024)),
      totalMemMB: Math.round(os.totalmem() / (1024 * 1024)),
      nodeVersion: process.version
    },
    processMemory: {
      rssMB: Math.round(memoryUsage.rss / (1024 * 1024)),
      heapUsedMB: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
      heapTotalMB: Math.round(memoryUsage.heapTotal / (1024 * 1024))
    }
  });
});

/**
 * @route GET /api/info
 * @desc Returns application metadata and runtime environment info
 */
router.get('/info', (req, res) => {
  res.status(200).json({
    app: {
      name: process.env.APP_NAME || 'DevOps Demo App',
      version: '1.0.0',
      description: 'A modern lightweight Node.js demo app'
    },
    runtime: {
      node: process.version,
      pid: process.pid,
      uptime: `${Math.floor(process.uptime())} seconds`,
      arch: os.arch(),
      cpus: os.cpus().length,
      hostname: os.hostname()
    }
  });
});

/**
 * @route GET /api/items
 * @desc Retrieve all demo learning items
 */
router.get('/items', (req, res) => {
  res.status(200).json({
    count: items.length,
    items
  });
});

/**
 * @route POST /api/items
 * @desc Create a new learning item
 */
router.post('/items', (req, res) => {
  const { title, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Title is required and must be a non-empty string'
    });
  }

  const newItem = {
    id: nextId++,
    title: title.trim(),
    category: category && typeof category === 'string' ? category.trim() : 'General',
    completed: false,
    createdAt: new Date().toISOString()
  };

  items.push(newItem);

  res.status(201).json({
    message: 'Item created successfully',
    item: newItem
  });
});

/**
 * @route DELETE /api/items/:id
 * @desc Delete a learning item by ID
 */
router.delete('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID supplied' });
  }

  const initialLength = items.length;
  items = items.filter(item => item.id !== id);

  if (items.length === initialLength) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.status(200).json({
    message: `Item #${id} deleted successfully`,
    remainingCount: items.length
  });
});

export default router;
