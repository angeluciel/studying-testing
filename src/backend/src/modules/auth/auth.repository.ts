import { Pool } from 'pg';

export class AuthRepository {
  constructor(private readonly db: Pool) {}

  async findByEmail(email: string) {
    const result = await this.db.query(
      `select id, email, password_hash, role, is_active
                from public.users
                where email = $1`,
      [email.toLowerCase()],
    );
    return result.rows[0] ?? null;
  }

  async insertPasswordChangeToken(userId: string, tokenHash: string) {
    const result = await this.db.query(
      `insert into password_change_tokens (user_id, token_hash, expires_at)
        values ($1, $2, now() + interval '30 minutes')`,
      [userId, tokenHash],
    );
    return result.rows[0] ?? null;
  }

  async changePassword(tokenHash: string) {
    const result = await this.db.query(
      `select pct.id, pct.user_id
            from password_change_tokens pct
            where pct.token_hash = $1
            and pct.user_at is null
            and pct.expires_at > now()
            limit 1`,
      [tokenHash],
    );
    return result.rows[0] ?? null;
  }
}
