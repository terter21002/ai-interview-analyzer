export interface Message {
  id: string;
  sessionId: string;
  content: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMResponse {
  followUp: string;
  themeTag: string;
  confidence: number;
  metadata?: {
    model?: string;
    tokens?: number | undefined;
    latency?: number;
  };
}

export interface Response {
  id: string;
  messageId: string;
  followUp: string;
  themeTag: string;
  confidence: number;
  llmMetadata?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface Theme {
  id: string;
  sessionId: string;
  tag: string;
  confidence: number;
  firstOccurrence: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageRequest {
  content: string;
  sessionId?: string; // Optional, will create new session if not provided
}

export interface CreateMessageResponse {
  message: Message;
  response: LLMResponse;
  session: Session;
  themes: Theme[];
}

export interface GetSessionResponse {
  session: Session;
  messages: Message[];
  responses: Response[];
  themes: Theme[];
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: Date;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  database: 'connected' | 'disconnected';
} 