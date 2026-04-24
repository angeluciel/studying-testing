import { Pool } from 'pg';
import { env } from '../config/env';
import { drizzle } from 'drizzle-orm/node-postgres';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV == 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle({ client: pool });
