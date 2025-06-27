import { LLMService } from './llmService';
import { SessionModel } from '../models/sessionModel';
import { MessageModel } from '../models/messageModel';
import { ResponseModel } from '../models/responseModel';
import { ThemeModel } from '../models/themeModel';
import { 
  CreateMessageRequest, 
  CreateMessageResponse, 
  GetSessionResponse,
  LLMResponse 
} from '../types';
import { logger } from '../utils/logger';

export class InterviewService {
  private llmService: LLMService;

  constructor() {
    this.llmService = LLMService.getInstance();
  }

  async processMessage(request: CreateMessageRequest): Promise<CreateMessageResponse> {
    try {
      // Get or create session
      let session;
      if (request.sessionId) {
        session = await SessionModel.findById(request.sessionId);
        if (!session) {
          throw new Error('Session not found');
        }
        await SessionModel.update(request.sessionId);
      } else {
        session = await SessionModel.create();
      }

      // Create message
      const message = await MessageModel.create(session.id, request.content);

      // Get conversation history for context
      const conversationHistory = await this.getConversationHistory(session.id);

      // Analyze with LLM
      const llmResponse = await this.llmService.analyzeMessage(
        request.content,
        conversationHistory
      );

      // Store LLM response
      const response = await ResponseModel.create(
        message.id,
        llmResponse.followUp,
        llmResponse.themeTag,
        llmResponse.confidence,
        llmResponse.metadata
      );

      // Handle theme accumulation
      const themes = await this.accumulateThemes(session.id, llmResponse);

      logger.info('Message processed successfully', {
        sessionId: session.id,
        messageId: message.id,
        themeTag: llmResponse.themeTag,
        confidence: llmResponse.confidence
      });

      return {
        message,
        response: llmResponse,
        session,
        themes
      };
    } catch (error) {
      logger.error('Error processing message:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<GetSessionResponse> {
    try {
      const session = await SessionModel.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const messages = await MessageModel.findBySessionId(sessionId);
      const responses = await ResponseModel.findBySessionId(sessionId);
      const themes = await ThemeModel.findBySessionId(sessionId);

      return {
        session,
        messages,
        responses,
        themes
      };
    } catch (error) {
      logger.error('Error getting session:', error);
      throw error;
    }
  }

  async getThemes(sessionId: string): Promise<any[]> {
    try {
      const themes = await ThemeModel.findBySessionId(sessionId);
      
      // Group themes by tag and calculate average confidence
      const themeGroups = themes.reduce((acc, theme) => {
        if (!acc[theme.tag]) {
          acc[theme.tag] = {
            tag: theme.tag,
            count: 0,
            totalConfidence: 0,
            firstOccurrence: theme.firstOccurrence,
            lastOccurrence: theme.firstOccurrence
          };
        }
        
        acc[theme.tag].count++;
        acc[theme.tag].totalConfidence += theme.confidence;
        acc[theme.tag].lastOccurrence = theme.firstOccurrence;
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(themeGroups).map(group => ({
        ...group,
        averageConfidence: group.totalConfidence / group.count
      }));
    } catch (error) {
      logger.error('Error getting themes:', error);
      throw error;
    }
  }

  private async getConversationHistory(sessionId: string): Promise<string[]> {
    const messages = await MessageModel.findBySessionId(sessionId);
    return messages.map(msg => msg.content);
  }

  private async accumulateThemes(sessionId: string, llmResponse: LLMResponse): Promise<any[]> {
    try {
      // Check if theme already exists for this session
      const existingThemes = await ThemeModel.findBySessionId(sessionId);
      const existingTheme = existingThemes.find(theme => theme.tag === llmResponse.themeTag);

      if (existingTheme) {
        // Update confidence if new confidence is higher
        if (llmResponse.confidence > existingTheme.confidence) {
          await ThemeModel.updateConfidence(existingTheme.id, llmResponse.confidence);
        }
      } else {
        // Create new theme
        await ThemeModel.create(sessionId, llmResponse.themeTag, llmResponse.confidence);
      }

      // Return updated themes
      return await ThemeModel.findBySessionId(sessionId);
    } catch (error) {
      logger.error('Error accumulating themes:', error);
      throw error;
    }
  }
} 