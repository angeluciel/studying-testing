import { Db } from './pool';
import { SeedUtils } from './seed';

async function main(): Promise<void> {
  const seed = new SeedUtils(Db);
  await seed.seedUser('joao@exemplo.com', 'admin');
  await seed.seedUser('user@exemplo.com', 'user');
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
