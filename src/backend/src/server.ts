import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

function main(): void {
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT.toString()}`);
  });
}

main();
