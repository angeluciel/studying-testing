import type { TestProject } from 'vitest/node';

import { TestingInfrastructure } from '../db/testContainers';

const testInfra = new TestingInfrastructure();

export async function setup(project: TestProject): Promise<void> {
  const { postgres, mailpit } = await testInfra.start();

  project.provide('DATABASE_URL', postgres.container.getConnectionUri());
  project.provide('SMTP_HOST', mailpit.container.getHost());
  project.provide('SMTP_PORT', String(mailpit.container.getMappedPort(1025)));
  project.provide('MAILPIT_UI_PORT', String(mailpit.container.getMappedPort(8025)));
}

export async function teardown(): Promise<void> {
  await testInfra.stop();
}
