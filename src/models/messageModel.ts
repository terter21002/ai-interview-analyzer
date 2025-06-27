import { v4 as uuidv4 } from 'uuid';
import { database } from '../database/connection';
import { Message } from '../types';

export class MessageModel {
  static async create(sessionId: string, content: string): Promise<Message> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await database.run(
      'INSERT INTO messages (id, session_id, content, timestamp, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, sessionId, content, now, now, now]
    );

    return {
      id,
      sessionId,
      content,
      timestamp: new Date(now),
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  static async findById(id: string): Promise<Message | null> {
    const row = await database.get(
      'SELECT * FROM messages WHERE id = ?',
      [id]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      sessionId: row.session_id,
      content: row.content,
      timestamp: new Date(row.timestamp),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  static async findBySessionId(sessionId: string): Promise<Message[]> {
    const rows = await database.all(
      'SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC',
      [sessionId]
    );

    return rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      content: row.content,
      timestamp: new Date(row.timestamp),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  static async delete(id: string): Promise<void> {
    await database.run('DELETE FROM messages WHERE id = ?', [id]);
  }
} 