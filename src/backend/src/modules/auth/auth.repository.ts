import { Pool } from 'pg';

export class AuthRepository {
  constructor(private readonly db: Pool) {}

  // PCT = Password Change Token
  async findByEmail(email: string) {
    const result = await this.db.query(
      `select id, email, password_hash, role, is_active
                from public.users
                where email = $1`,
      [email.toLowerCase()],
    );
    return result.rows[0] ?? null;
  }

  async insertPwdChangeTk(userId: string, tokenHash: string) {
    const result = await this.db.query(
      `insert into password_change_tokens (user_id, token_hash, expires_at)
        values ($1, $2, now() + interval '30 minutes')`,
      [userId, tokenHash],
    );
    return result.rows[0] ?? null;
  }

  async findPwdChangeTkByHash(tokenHash: string) {
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

  async updatePwdAndConsumeTk(params: {
    userId: string;
    tokenId: string;
    passwordHash: string;
  }): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');
      await client.query(
        `update users
            set password_hash = $1
            where id = $2`,
        [params.passwordHash, params.userId],
      );

      await client.query(
        `update password_change_tokens
            set used_at = now()
            where id = $1`,
        [params.tokenId],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
