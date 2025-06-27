import { database } from './connection';
import { logger } from '../utils/logger';

const createTables = async (): Promise<void> => {
  try {
    // Create sessions table
    await database.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    await database.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
      )
    `);

    // Create responses table
    await database.run(`
      CREATE TABLE IF NOT EXISTS responses (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        follow_up TEXT NOT NULL,
        theme_tag TEXT NOT NULL,
        confidence REAL NOT NULL,
        llm_metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
      )
    `);

    // Create themes table
    await database.run(`
      CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        confidence REAL NOT NULL,
        first_occurrence DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await database.run('CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages (session_id)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_responses_message_id ON responses (message_id)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_themes_session_id ON themes (session_id)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_themes_tag ON themes (tag)');

    logger.info('Database tables created successfully');
  } catch (error) {
    logger.error('Error creating database tables:', error);
    throw error;
  }
};

const migrate = async (): Promise<void> => {
  try {
    await database.connect();
    await createTables();
    await database.disconnect();
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  migrate();
} 