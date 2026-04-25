import { TestingInfrastructure } from '../db/testContainers';
import type { TestProject } from 'vitest/node';

class GlobalSetup {
  private testingInfrastructure = new TestingInfrastructure();

  async setup(project: TestProject) {
    const { postgres, mailpit } = await this.testingInfrastructure.start();

    project.provide('DATABASE_URL', postgres.container.getConnectionUri());
    project.provide('SMTP_HOST', mailpit.container.getHost());
    project.provide('SMTP_PORT', String(mailpit.container.getMappedPort(1025)));
    project.provide('MAILPIT_UI_PORT', String(mailpit.container.getMappedPort(8025)));
  }

  async teardown() {
    await this.testingInfrastructure.stop();
  }
}

export default new GlobalSetup();
