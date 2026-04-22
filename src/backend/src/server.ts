import { env } from './config/env';
import { app } from './app';
import { logger } from './utils/logger';

async function main() {
  try {
    console.log('Testing direct connection to Elastic Cloud...');
    const res = await fetch(env.ELASTIC_NODE, {
      headers: {
        Authorization: `ApiKey ${env.ELASTIC_API_KEY}`,
      },
    });
    const data = await res.json();
    console.log(`[Elastic Test] Status: ${res.status}`);
    console.log(`[Elastic Test] Response:`, data);
  } catch (error) {
    console.error(`[Elastic Test] Network Error:`, error);
  }
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

main();
