import { pool } from './pool';
import { SeedUtils } from './seed';
import { Db } from './pool';

async function main() {
  const seed = new SeedUtils(Db);
  await seed.seedUser('joao@exemplo.com', 'admin');
  await seed.seedUser('user@exemplo.com', 'user');
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
