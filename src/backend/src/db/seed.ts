import type { DrizzleDb } from './pool';
import { env } from '../config/env';
import { usersTable } from './schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/utils/password';

export class SeedUtils {
  constructor(private readonly db: DrizzleDb) {}

  seedUser = async (mockEmail: string, role: 'admin' | 'user') => {
    const existing = await this.db.select().from(usersTable).where(eq(usersTable.email, mockEmail));

    if (existing.length > 0) {
      return existing[0];
    }
    // unit test call this function and check message is correct, and if length > 1.
    if (!env.TEMP_PASSWORD) {
      throw new Error('TEMP_PASSWORD must exist.');
    }
    const password = await hashPassword(env.TEMP_PASSWORD);

    const user = await this.db
      .insert(usersTable)
      .values({
        name: 'mock',
        email: mockEmail,
        surname: 'user',
        password_hash: password,
        role: role,
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        surname: usersTable.surname,
        role: usersTable.role,
        email_confirmed: usersTable.email_confirmed,
        is_active: usersTable.is_active,
        created_at: usersTable.created_at,
      });
    return user[0];
  };
}
