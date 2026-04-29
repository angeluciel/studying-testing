import fs from 'fs';
import path from 'path';

import type { Pool, PoolClient } from 'pg';

import { logger } from '../utils/logger';

type DbLike = Pool | PoolClient;

export async function runMigrations(db: DbLike): Promise<void> {
  await ensureMigrationsTable(db);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const already = await db.query(`SELECT 1 FROM migrations WHERE filename = $1 LIMIT 1`, [file]);

    if (already.rowCount && already.rowCount > 0) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

    try {
      await db.query('BEGIN');
      await db.query(sql);
      await db.query(`INSERT INTO migrations (filename) VALUES ($1)`, [file]);
      await db.query('COMMIT');

      logger.info(`Migration applied: ${file}`);
    } catch (err) {
      await db.query('ROLLBACK');
      logger.error(`Migration failed: ${file}`);
      throw err;
    }
  }
}

async function ensureMigrationsTable(db: DbLike): Promise<void> {
  await db.query(`
        CREATE TABLE IF NOT EXISTS migrations(
            id SERIAL PRIMARY KEY,
            filename TEXT UNIQUE NOT NULL,
            run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}
