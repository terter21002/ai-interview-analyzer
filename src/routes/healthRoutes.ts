import { Router, Request, Response } from 'express';
import { database } from '../database/connection';
import { HealthCheckResponse } from '../types';

const router = Router();

// GET /api/health - Health check
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await database.get('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'disconnected';
    }

    const healthResponse: HealthCheckResponse = {
      status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      version: '1.0.0',
      database: dbStatus
    };

    const statusCode = healthResponse.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      success: true,
      data: healthResponse
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: 'Health check failed',
      statusCode: 503,
      timestamp: new Date()
    });
  }
});

export default router; 