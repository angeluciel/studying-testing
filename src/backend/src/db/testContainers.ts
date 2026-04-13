import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";
import { runMigrations } from "./migrate";
import { logger } from "../utils/logger";

let postgresContainer: StartedPostgreSqlContainer | null = null;
let testPool: Pool | null = null;

/**
 * Start a fresh Postgre container for testing
 * This runs once per test SESSION
 */

export async function startTestContainer(): Promise<{
    container: StartedPostgreSqlContainer;
    pool: Pool;
}> {
    if (postgresContainer && testPool) {
        return {
            container: postgresContainer,
            pool: testPool,
        };
    }

    logger.info("Starting PostgreSQL test container...");

    postgresContainer = await new PostgreSqlContainer('postgres:17')
        .withDatabase('testdb')
        .withUsername('postgres')
        .withPassword('postgres')
        .start();
    
    logger.info("Postgres container started.");

    testPool = new Pool({
        connectionString: postgresContainer.getConnectionUri(),
        ssl: false,
    });

    logger.info(`Postgres container started at ${postgresContainer.getConnectionUri()}`);

    await runMigrations(testPool);

    return {
        container: postgresContainer,
        pool: testPool,
    };
}

export async function stopTestContainer(): Promise<void> {
    if (testPool) {
        await testPool.end();
        testPool = null;
    }

    if (postgresContainer) {
        await postgresContainer.stop();
        postgresContainer = null;
    }
}

/**
 * Get the test pool for a single test
 */
export function getTestPool(): Pool {
    if (!testPool) {
        throw new Error(
            "Test pool not initialized. Make sure testContainer is started in global setup."
        );
    }

    return testPool;
}

/**
 * Reset database between tests (truncate all tables)
 */

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
            logger.debug(`Database reset, ${tables.length} tables truncated.`)
        }
    } catch (err) {
        logger.error(`Faield to reset test database: ${err}`);
        throw err;
    }
}