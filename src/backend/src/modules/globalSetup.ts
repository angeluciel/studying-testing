import { startTestContainer, stopTestContainer } from "../db/testContainers";
import type { TestProject } from "vitest/node";

export async function setup(project: TestProject) {
    const { container } = await startTestContainer();
    
    project.provide("DATABASE_URL", container.getConnectionUri());
}

export async function teardown() {
    await stopTestContainer();
}