import { GenericContainer, StartedTestContainer } from "testcontainers";
import { logger } from "../../utils/logger";

let mailpitContainer: StartedTestContainer | null = null;

export async function startMailpitContainer(): Promise<{
    container: StartedTestContainer;
    smtpHost: string;
    smtpPort: number;
    uiPort: number;
}> {
    if (mailpitContainer) {
        return {
            container: mailpitContainer,
            smtpHost: mailpitContainer.getHost(),
            smtpPort: mailpitContainer.getMappedPort(1025),
            uiPort: mailpitContainer.getMappedPort(8025),
        };
    }

    logger.info("Starting Mailpit test container...");

    mailpitContainer = await new GenericContainer("axllent/mailpit")
        .withExposedPorts(1025, 8025)
        .start();

    const smtpHost = mailpitContainer.getHost();
    const smtpPort = mailpitContainer.getMappedPort(1025);
    const uiPort = mailpitContainer.getMappedPort(8025);

    logger.info(`Mailpit container started — SMTP: ${smtpHost}:${smtpPort}, UI: ${smtpHost}:${uiPort}`);

    return { container: mailpitContainer, smtpHost, smtpPort, uiPort };
}

export async function stopMailpitContainer(): Promise<void> {
    if (mailpitContainer) {
        await mailpitContainer.stop();
        mailpitContainer = null;
    }
}
