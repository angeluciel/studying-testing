import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { logger } from '../../utils/logger';

let mailpitContainer: StartedTestContainer | null = null;

export class MailpitContainer {
  private mailpitContainer: StartedTestContainer | null;
  constructor() {
    this.mailpitContainer = null;
  }

  async start(): Promise<{
    container: StartedTestContainer;
    smtpHost: string;
    smtpPort: number;
    uiPort: number;
  }> {
    if (this.mailpitContainer) {
      return {
        container: this.mailpitContainer,
        smtpHost: this.mailpitContainer.getHost(),
        smtpPort: this.mailpitContainer.getMappedPort(1025),
        uiPort: this.mailpitContainer.getMappedPort(8025),
      };
    }

    try {
      logger.info('Starting mailpit test container...');
      this.mailpitContainer = await new GenericContainer('axllent/mailpit')
        .withExposedPorts(1025, 8025)
        .start();

      const smtpHost = this.mailpitContainer.getHost();
      const smtpPort = this.mailpitContainer.getMappedPort(1025);
      const uiPort = this.mailpitContainer.getMappedPort(8025);

      logger.info(
        `Mailpit container started.\nSMTP: ${smtpHost}:${smtpPort}.\nUI: ${smtpHost}:${uiPort}`,
      );

      return { container: this.mailpitContainer, smtpHost, smtpPort, uiPort };
    } catch (err) {
      logger.error(`Failed to start Mailpit container: ${err}`);
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (this.mailpitContainer) {
      try {
        await this.mailpitContainer.stop();
      } catch (err) {
        logger.error(`Failed to stop Mailpit container: ${err}`);
      } finally {
        this.mailpitContainer = null;
      }
    }
  }
}
