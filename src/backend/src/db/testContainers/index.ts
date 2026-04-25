import { TestDatabaseContainer } from './postgres';
import { MailpitContainer } from './mailpit';

export class TestingInfrastructure {
  private testPg = new TestDatabaseContainer();
  private testMail = new MailpitContainer();

  start = async () => {
    const [postgres, mailpit] = await Promise.all([this.testPg.start(), this.testMail.start()]);
    return { postgres, mailpit };
  };
  stop = async () => {
    await Promise.all([this.testPg.stop(), this.testMail.stop()]);
  };
}
