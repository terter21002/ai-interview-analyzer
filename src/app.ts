import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { database } from './database/connection';
import interviewRoutes from './routes/interviewRoutes';
import healthRoutes from './routes/healthRoutes';
import { logger } from './utils/logger';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429,
    timestamp: new Date()
  }
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', interviewRoutes);
app.use('/api', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Interview Analyzer API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      messages: '/api/messages',
      sessions: '/api/sessions/:id',
      themes: '/api/themes/:sessionId'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found',
    statusCode: 404,
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
    timestamp: new Date()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 