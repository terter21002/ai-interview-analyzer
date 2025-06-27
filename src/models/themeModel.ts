import { v4 as uuidv4 } from 'uuid';
import { database } from '../database/connection';
import { Theme } from '../types';

export class ThemeModel {
  static async create(
    sessionId: string,
    tag: string,
    confidence: number
  ): Promise<Theme> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await database.run(
      'INSERT INTO themes (id, session_id, tag, confidence, first_occurrence, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, sessionId, tag, confidence, now, now, now]
    );

    return {
      id,
      sessionId,
      tag,
      confidence,
      firstOccurrence: new Date(now),
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  static async findBySessionId(sessionId: string): Promise<Theme[]> {
    const rows = await database.all(
      'SELECT * FROM themes WHERE session_id = ? ORDER BY first_occurrence ASC',
      [sessionId]
    );

    return rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      tag: row.tag,
      confidence: row.confidence,
      firstOccurrence: new Date(row.first_occurrence),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  static async findByTag(tag: string): Promise<Theme[]> {
    const rows = await database.all(
      'SELECT * FROM themes WHERE tag = ? ORDER BY first_occurrence DESC',
      [tag]
    );

    return rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      tag: row.tag,
      confidence: row.confidence,
      firstOccurrence: new Date(row.first_occurrence),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  static async updateConfidence(id: string, confidence: number): Promise<void> {
    const now = new Date().toISOString();
    await database.run(
      'UPDATE themes SET confidence = ?, updated_at = ? WHERE id = ?',
      [confidence, now, id]
    );
  }

  static async delete(id: string): Promise<void> {
    await database.run('DELETE FROM themes WHERE id = ?', [id]);
  }

  static async deleteBySessionId(sessionId: string): Promise<void> {
    await database.run('DELETE FROM themes WHERE session_id = ?', [sessionId]);
  }
} 