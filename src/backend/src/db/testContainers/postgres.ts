import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";
import { runMigrations } from "../migrate";
import { logger } from "../../utils/logger";

let postgresContainer: StartedPostgreSqlContainer | null = null;
let testPool: Pool | null = null;

export async function startPostgresContainer(): Promise<{
    container: StartedPostgreSqlContainer;
    pool: Pool;
}> {
    if (postgresContainer && testPool) {
        return { container: postgresContainer, pool: testPool };
    }

    logger.info("Starting PostgreSQL test container...");

    postgresContainer = await new PostgreSqlContainer("postgres:17")
        .withDatabase("testdb")
        .withUsername("postgres")
        .withPassword("postgres")
        .start();

    testPool = new Pool({
        connectionString: postgresContainer.getConnectionUri(),
        ssl: false,
    });

    logger.info(`Postgres container started at ${postgresContainer.getConnectionUri()}`);

    await runMigrations(testPool);

    return { container: postgresContainer, pool: testPool };
}

export async function stopPostgresContainer(): Promise<void> {
    if (testPool) {
        await testPool.end();
        testPool = null;
    }

    if (postgresContainer) {
        await postgresContainer.stop();
        postgresContainer = null;
    }
}

export function getTestPool(): Pool {
    if (!testPool) {
        throw new Error(
            "Test pool not initialized. Make sure testContainer is started in global setup."
        );
    }

    return testPool;
}

export async function resetTestDatabase(): Promise<void> {
    const pool = getTestPool();

    try {
        const result = await pool.query(`
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
        `);

        const tables = result.rows.map((row) => row.tablename);

        if (tables.length === 0) return;

        const truncateQuery = tables
            .map((table) => `TRUNCATE TABLE "${table}" CASCADE`)
            .join("; ");

        if (truncateQuery) {
            await pool.query(truncateQuery);
            logger.debug(`Database reset, ${tables.length} tables truncated.`);
        }
    } catch (err) {
        logger.error(`Failed to reset test database: ${err}`);
        throw err;
    }
}
