import { Request, Response } from 'express';
import { InterviewService } from '../services/interviewService';
import { CreateMessageRequest } from '../types';
import { logger } from '../utils/logger';

export class InterviewController {
  private interviewService: InterviewService;

  constructor() {
    this.interviewService = new InterviewService();
  }

  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateMessageRequest = req.body;
      
      if (!request.content || typeof request.content !== 'string') {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Content is required and must be a string',
          statusCode: 400,
          timestamp: new Date()
        });
        return;
      }

      const result = await this.interviewService.processMessage(request);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in createMessage controller:', error);
      
      if (error instanceof Error && error.message === 'Session not found') {
        res.status(404).json({
          error: 'SESSION_NOT_FOUND',
          message: 'Session not found',
          statusCode: 404,
          timestamp: new Date()
        });
        return;
      }

      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
        statusCode: 500,
        timestamp: new Date()
      });
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Session ID is required',
          statusCode: 400,
          timestamp: new Date()
        });
        return;
      }

      const result = await this.interviewService.getSession(id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getSession controller:', error);
      
      if (error instanceof Error && error.message === 'Session not found') {
        res.status(404).json({
          error: 'SESSION_NOT_FOUND',
          message: 'Session not found',
          statusCode: 404,
          timestamp: new Date()
        });
        return;
      }

      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
        statusCode: 500,
        timestamp: new Date()
      });
    }
  }

  async getThemes(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Session ID is required',
          statusCode: 400,
          timestamp: new Date()
        });
        return;
      }

      const themes = await this.interviewService.getThemes(sessionId);
      
      res.status(200).json({
        success: true,
        data: {
          sessionId,
          themes
        }
      });
    } catch (error) {
      logger.error('Error in getThemes controller:', error);
      
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
        statusCode: 500,
        timestamp: new Date()
      });
    }
  }
} 