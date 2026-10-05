import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables from .env if present
dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
=====================================================
🚀 Server is running!
🌐 URL: http://localhost:${PORT}
🩺 Health Check: http://localhost:${PORT}/api/health
ℹ️  App Info: http://localhost:${PORT}/api/info
📦 Environment: ${process.env.NODE_ENV || 'development'}
=====================================================
  `);
});

// Graceful shutdown handling for container and process managers (Docker, K8s, PM2)
const handleShutdown = (signal) => {
  console.log(`\n[${signal}] Received signal. Gracefully shutting down...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown if taking longer than 10s
  setTimeout(() => {
    console.error('Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
