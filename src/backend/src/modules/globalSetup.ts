import { startTestInfrastructure, stopTestInfrastructure } from "../db/testContainers";
import type { TestProject } from "vitest/node";

export async function setup(project: TestProject) {
    const { postgres, mailpit } = await startTestInfrastructure();

    project.provide("DATABASE_URL", postgres.container.getConnectionUri());
    project.provide("SMTP_HOST", mailpit.container.getHost());
    project.provide("SMTP_PORT", String(mailpit.container.getMappedPort(1025)));
    project.provide("MAILPIT_UI_PORT", String(mailpit.container.getMappedPort(8025)));
}

export async function teardown() {
    await stopTestInfrastructure();
}