import { LLMResponse } from '../types';
import { logger } from '../utils/logger';
import OpenAI from 'openai';
import 'dotenv/config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set.');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export class LLMService {
  private static instance: LLMService;

  private constructor() {}

  static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  async analyzeMessage(content: string, conversationHistory: string[] = []): Promise<LLMResponse> {
    const startTime = Date.now();
    try {
      // Compose the prompt
      const systemPrompt = `You are an AI interview assistant. For each user message, generate:\n- a follow-up question\n- a theme tag (format: category: value, e.g., taste_profile: bitter)\n- a confidence score between 0 and 1\nRespond in this JSON format:\n{\"followUp\": \"...\", \"themeTag\": \"...\", \"confidence\": 0.92}`;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt } as OpenAI.Chat.Completions.ChatCompletionSystemMessageParam,
        ...conversationHistory.map(
          (msg) => ({ role: 'user', content: msg } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam)
        ),
        { role: 'user', content } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 200
      });

      const aiMessage = completion.choices[0]?.message?.content?.trim();
      if (!aiMessage) throw new Error('No response from OpenAI');

      // Try to parse the JSON from the response
      let parsed: LLMResponse | null = null;
      try {
        parsed = JSON.parse(aiMessage);
      } catch (err) {
        // Try to extract JSON from text if not pure JSON
        const match = aiMessage.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error('Failed to parse LLM response as JSON');
        }
      }
      if (!parsed) throw new Error('Parsed LLM response is null');

      const latency = Date.now() - startTime;
      logger.info('OpenAI LLM analysis completed', {
        content: content.substring(0, 100) + '...',
        latency,
        model: 'gpt-3.5-turbo',
        tokens: completion.usage && typeof completion.usage.total_tokens === 'number'
          ? completion.usage.total_tokens
          : undefined
      });

      return {
        followUp: parsed.followUp,
        themeTag: parsed.themeTag,
        confidence: parsed.confidence,
        metadata: {
          model: 'gpt-3.5-turbo',
          tokens: completion.usage && typeof completion.usage.total_tokens === 'number'
            ? completion.usage.total_tokens
            : undefined,
          latency
        }
      };
    } catch (error) {
      logger.error('OpenAI LLM analysis failed:', error);
      throw new Error('Failed to analyze message with OpenAI');
    }
  }
} 