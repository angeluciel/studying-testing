import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { runMigrations } from '../migrate';
import { logger } from '@/utils/logger';

export class TestDatabaseContainer {
  private container: StartedPostgreSqlContainer | null;
  private pool: Pool | null;

  constructor() {
    this.container = null;
    this.pool = null;
  }

  start = async () => {
    if (this.container && this.pool) {
      return { container: this.container, pool: this.pool };
    }

    logger.info('Starting PostgreSQL test container...');
    this.container = await new PostgreSqlContainer('postgres:17')
      .withDatabase('testdb')
      .withUsername('postgres')
      .withPassword('postgres')
      .start();

    this.pool = new Pool({
      connectionString: this.container.getConnectionUri(),
      ssl: false,
    });

    logger.info(`Postgres container started at ${this.container.getConnectionUri()}`);

    await runMigrations(this.pool);

    return { container: this.container, pool: this.pool };
  };

  stop = async () => {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    if (this.container) {
      await this.container.stop();
      this.container = null;
    }
  };

  getPool = async () => {
    if (!this.pool) {
      throw new Error(
        `Test Pool not initialized. Make sure testContainer is started in GlobalSetup.ts.`,
      );
    }
    return this.pool;
  };

  reset = async () => {
    if (!this.pool) {
      throw new Error('Test pool not initialized...');
    }

    try {
      const result = await this.pool.query(
        `SELECT tablename FROM pg_tables
                 WHERE schemaname = 'public'`,
      );

      const tables: string[] = result.rows.map((row) => row.tablename as string);
      if (tables.length === 0) return;

      const tableList = tables.map((table) => `"${table}"`).join(', ');

      if (tableList) {
        await this.pool.query(`TRUNCATE TABLE ${tableList} CASCADE`);
        logger.debug(`Database reset, ${tables.length} tables truncated.`);
      }
    } catch (err) {
      logger.error(`Failed to reset test database: ${err}`);
      throw err;
    }
  };
}
