/**
 * EDA Playground - Backend Server
 */

import express from 'express';
import path from 'path';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import integrationsRouter from './routes/integrations';
import proxyRouter from './routes/proxy';

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json());

// In production, serve frontend static files
// In development, use CORS to allow separate frontend server
if (NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
  console.log(`Serving static files from: ${publicPath}`);
} else {
  app.use(corsMiddleware);
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API routes
app.use('/api/integrations', integrationsRouter);
app.use('/api/proxy', proxyRouter);

// In production, serve index.html for all other routes (SPA routing)
if (NODE_ENV === 'production') {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
}

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 EDA Playground - Backend Server');
  console.log('='.repeat(50));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/integrations`);
  console.log('='.repeat(50));
});
