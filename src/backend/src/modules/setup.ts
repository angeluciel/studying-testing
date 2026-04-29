import { beforeEach, afterAll, inject } from 'vitest';

import { TestDatabase } from '@/db/resetDatabase.js';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = inject('DATABASE_URL');
process.env.SMTP_HOST = inject('SMTP_HOST');
process.env.SMTP_PORT = inject('SMTP_PORT');

beforeEach(async () => {
  vi.clearAllMocks();
  const { Db } = await import('@/db/pool.js');
  const testDatabase = new TestDatabase(Db);
  await testDatabase.resetDatabase();
});

afterAll(async () => {
  const { pool } = await import('../db/pool.js');
  await pool.end();
});
