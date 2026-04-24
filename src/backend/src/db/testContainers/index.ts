import { TestDatabaseContainer } from './postgres';
import { startMailpitContainer, stopMailpitContainer } from './mailpit';

export class TestingInfrastructure {
  private testDatabaseContainer = new TestDatabaseContainer();

  Start = async () => {
    const [postgres, mailpit] = await Promise.all([
      this.testDatabaseContainer.start(),
      startMailpitContainer(),
    ]);
  };
}

export async function startTestInfrastructure() {
  const [postgres, mailpit] = await Promise.all([
    startPostgresContainer(),
    startMailpitContainer(),
  ]);

  return { postgres, mailpit };
}

export async function stopTestInfrastructure(): Promise<void> {
  await Promise.all([stopPostgresContainer(), stopMailpitContainer()]);
}

export {
  startPostgresContainer,
  stopPostgresContainer,
  getTestPool,
  resetTestDatabase,
} from './postgres';
export { startMailpitContainer, stopMailpitContainer } from './mailpit';
