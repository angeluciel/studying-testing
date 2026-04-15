import { startPostgresContainer, stopPostgresContainer } from "./postgres";
import { startMailpitContainer, stopMailpitContainer } from "./mailpit";

export async function startTestInfrastructure() {
    const [postgres, mailpit] = await Promise.all([
        startPostgresContainer(),
        startMailpitContainer(),
    ]);

    return { postgres, mailpit };
}

export async function stopTestInfrastructure(): Promise<void> {
    await Promise.all([
        stopPostgresContainer(),
        stopMailpitContainer(),
    ]);
}

export { startPostgresContainer, stopPostgresContainer, getTestPool, resetTestDatabase } from "./postgres";
export { startMailpitContainer, stopMailpitContainer } from "./mailpit";
