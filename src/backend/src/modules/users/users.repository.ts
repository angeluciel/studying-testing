import { eq, sql } from 'drizzle-orm';

import type { DrizzleDb } from '@/db/pool';
import { usersTable } from '@/db/schema';
import type { UserRow, CreateUserInput, UpdateUserInput } from '@/types/user';

export class UserRepository {
  constructor(private readonly db: DrizzleDb) {}

  async create(input: CreateUserInput): Promise<UserRow> {
    const result = await this.db
      .insert(usersTable)
      .values({
        name: input.name,
        email: input.email,
        surname: input.surname,
        password_hash: input.passwordHash,
        role: input.role ?? 'user',
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

    return result[0];
  }

  async findById(id: string): Promise<UserRow | null> {
    const result = await this.db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        surname: usersTable.surname,
        role: usersTable.role,
        email_confirmed: usersTable.email_confirmed,
        is_active: usersTable.is_active,
        created_at: usersTable.created_at,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    return result[0];
  }

  async update(id: string, data: UpdateUserInput): Promise<UserRow | null> {
    const result = await this.db
      .update(usersTable)
      .set({
        name: sql`COALESCE(${data.name}, name)`,
        surname: sql`COALESCE(${data.surname}, surname)`,
      })
      .where(eq(usersTable.id, id))
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

    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(usersTable).where(eq(usersTable.id, id));
  }
}
