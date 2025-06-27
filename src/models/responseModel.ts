import { v4 as uuidv4 } from 'uuid';
import { database } from '../database/connection';
import { Response } from '../types';

export class ResponseModel {
  static async create(
    messageId: string,
    followUp: string,
    themeTag: string,
    confidence: number,
    llmMetadata?: object
  ): Promise<Response> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const metadata = llmMetadata ? JSON.stringify(llmMetadata) : null;

    await database.run(
      'INSERT INTO responses (id, message_id, follow_up, theme_tag, confidence, llm_metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, messageId, followUp, themeTag, confidence, metadata, now, now]
    );

    return {
      id,
      messageId,
      followUp,
      themeTag,
      confidence,
      llmMetadata: metadata || undefined,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  static async findByMessageId(messageId: string): Promise<Response | null> {
    const row = await database.get(
      'SELECT * FROM responses WHERE message_id = ?',
      [messageId]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      messageId: row.message_id,
      followUp: row.follow_up,
      themeTag: row.theme_tag,
      confidence: row.confidence,
      llmMetadata: row.llm_metadata || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  static async findBySessionId(sessionId: string): Promise<Response[]> {
    const rows = await database.all(
      `SELECT r.* FROM responses r
       JOIN messages m ON r.message_id = m.id
       WHERE m.session_id = ?
       ORDER BY m.timestamp ASC`,
      [sessionId]
    );

    return rows.map(row => ({
      id: row.id,
      messageId: row.message_id,
      followUp: row.follow_up,
      themeTag: row.theme_tag,
      confidence: row.confidence,
      llmMetadata: row.llm_metadata || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  static async delete(id: string): Promise<void> {
    await database.run('DELETE FROM responses WHERE id = ?', [id]);
  }
} 