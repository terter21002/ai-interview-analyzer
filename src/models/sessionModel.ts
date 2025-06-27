import { v4 as uuidv4 } from 'uuid';
import { database } from '../database/connection';
import { Session } from '../types';
import { logger } from '../utils/logger';

export class SessionModel {
  static async create(userId?: string): Promise<Session> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await database.run(
      'INSERT INTO sessions (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [id, userId || null, now, now]
    );

    return {
      id,
      userId: userId || undefined,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  static async findById(id: string): Promise<Session | null> {
    const row = await database.get(
      'SELECT * FROM sessions WHERE id = ?',
      [id]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.user_id || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  static async update(id: string): Promise<void> {
    const now = new Date().toISOString();
    await database.run(
      'UPDATE sessions SET updated_at = ? WHERE id = ?',
      [now, id]
    );
  }

  static async delete(id: string): Promise<void> {
    await database.run('DELETE FROM sessions WHERE id = ?', [id]);
  }

  static async list(limit: number = 100, offset: number = 0): Promise<Session[]> {
    const rows = await database.all(
      'SELECT * FROM sessions ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }
} 