import { pool } from './pool';
import { createUser } from '../modules/users/users.service';
import { env } from '../config/env';
import { UserRow } from '../types/user';

export async function seedAdminUser(): Promise<UserRow> {
  const existing = await pool.query(
    `SELECT id, email, name, surname, role, email_confirmed, is_active, created_at FROM users WHERE email = $1 LIMIT 1`,
    ['admin@example.com'],
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  if (!env.TEMP_PASSWORD) {
    throw new Error('TEMP_PASSWORD must exist');
  }

  const user = await createUser({
    email: 'admin@example.com',
    name: 'Main',
    surname: 'Admin',
    password: env.TEMP_PASSWORD,
    role: 'admin',
  });

  console.log('Initial admin user created successfully.');

  return user;
}
