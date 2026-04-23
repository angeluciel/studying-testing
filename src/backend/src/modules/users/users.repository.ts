import { Pool } from 'pg';
import { UserRow, CreateUserInput, UpdateUserInput } from '@/types/user';
import { resourceLimits } from 'node:worker_threads';

export class UserRepository {
  constructor(private readonly db: Pool) {}

  async create(input: CreateUserInput): Promise<UserRow> {
    const result = await this.db.query<UserRow>(
      `INSERT INTO public.users (email, name, surname, password_hash, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, name, surname, role, email_confirmed, is_active, created_at`,
      [
        input.email.toLowerCase(),
        input.name,
        input.surname,
        input.passwordHash,
        input.role ?? 'user',
      ],
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<UserRow | null> {
    const result = await this.db.query(
      `select id, email, name, surname, role, email_confirmed, is_active, created_at
            from public.users
            where id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async update(id: string, data: UpdateUserInput): Promise<UserRow | null> {
    const result = await this.db.query<UserRow>(
      `UPDATE public.users
        SET
            name    = COALESCE($1, name),
            surname = COALESCE($2, surname)
        WHERE id = $3
        RETURNING id, email, name, surname, role, email_confirmed, is_active, created_at`,
      [data.name ?? null, data.surname ?? null, id],
    );
    return result.rows[0] ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM public.users WHERE id = $1`, [id]);
  }
}
