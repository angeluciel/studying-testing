import { DrizzleDb } from '@/db/pool';
import { sql } from 'drizzle-orm';

export class TestDatabase {
  constructor(private readonly db: DrizzleDb) {}

  resetDatabase = async () => {
    await this.db.execute(sql`
        DO $$
        DECLARE
          r RECORD;
        BEGIN
          FOR r in (
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
              AND tablename <> 'migrations'
            )
            LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
            END LOOP;
          END $$;
      `);
  };
}
