import { passwordChangeTokensTable, usersTable } from '@/db/schema';
import { DrizzleDb } from '@/db/pool';
import { eq, sql, isNull, and, gt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export class AuthRepository {
  constructor(private readonly db: DrizzleDb) {}

  // PWD = Password
  // Tk  = Token
  async findByEmail(email: string) {
    const result = await this.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        password_hash: usersTable.password_hash,
        role: usersTable.role,
        is_active: usersTable.is_active,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return result[0] ?? null;
  }

  async insertPwdChangeTk(userId: string, tokenHash: string) {
    const result = await this.db.insert(passwordChangeTokensTable).values({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: sql`now() + interval '30 minutes'`,
    });

    return result.rows[0] ?? null;
  }

  async findPwdChangeTkByHash(tokenHash: string) {
    const pct = alias(passwordChangeTokensTable, 'pct');
    const result = await this.db
      .select({ id: pct.id, user_id: pct.user_id })
      .from(pct)
      .where(
        and(eq(pct.token_hash, tokenHash), isNull(pct.used_at), gt(pct.expires_at, sql`now()`)),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async updatePwdAndConsumeTk(params: {
    userId: string;
    tokenId: string;
    passwordHash: string;
  }): Promise<void> {
    await this.db.transaction(async (t) => {
      await t
        .update(usersTable)
        .set({ password_hash: params.passwordHash })
        .where(eq(usersTable.id, params.userId));
      await t
        .update(passwordChangeTokensTable)
        .set({ used_at: sql`now()` })
        .where(eq(passwordChangeTokensTable.id, params.tokenId));
    });
  }
}
