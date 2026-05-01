import { app } from './app';
import { env } from './config/env';
import { pool } from './db/pool';
import { logger } from './utils/logger';

async function closeDatabase(): Promise<void> {
  await pool.end();
  logger.info('Database pool closed.');
}

function main(): void {
  let isShuttingDown = false;

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT.toString()}`);
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`${signal} signal received. Shutting down gracefully.`);

    server.close((error) => {
      if (error) {
        logger.error(`${error} Error while closing HTTP server.`);
        process.exit(1);
      }

      logger.info('HTTP server closed.');

      closeDatabase()
        .then(() => process.exit(0))
        .catch((dbError: unknown) => {
          logger.error(`Error clsing database pool: ${String(dbError)}`);
          process.exit(1);
        });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();
