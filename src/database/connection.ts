import sqlite3 from 'sqlite3';
import path from 'path';
import { logger } from '../utils/logger';

const DB_PATH = path.join(__dirname, '../../database/interview_analyzer.db');

class Database {
  private db: sqlite3.Database | null = null;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          logger.error('Error connecting to database:', err);
          reject(err);
        } else {
          logger.info('Connected to SQLite database');
          this.enableForeignKeys();
          resolve();
        }
      });
    });
  }

  private enableForeignKeys(): void {
    if (this.db) {
      this.db.run('PRAGMA foreign_keys = ON');
    }
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            logger.error('Error closing database:', err);
            reject(err);
          } else {
            logger.info('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  getDatabase(): sqlite3.Database {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Database run error:', err);
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database all error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

export const database = new Database(); 