import pino, { type LoggerOptions, type TransportTargetOptions } from 'pino';
import { env } from '../config/env';

const isDev = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

const baseOptions: LoggerOptions = {
  level: isTest ? 'silent' : isDev ? 'debug' : 'info',
  messageKey: 'message',
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  base: {
    service: 'backend',
    env: env.NODE_ENV ?? 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const devTarget: TransportTargetOptions = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:HH:MM:ss',
    ignore: 'pid,hostname,service,env',
    messageKey: 'message',
  },
};

const elasticTarget: TransportTargetOptions = {
  target: 'pino-elasticsearch',
  level: 'info',
  options: {
    node: env.ELASTIC_NODE,
    auth: {
      apiKey: env.ELASTIC_API_KEY,
    },
    index: env.ELASTIC_INDEX ?? 'express-logs',
    esVersion: 8,
    flushBytes: 1000,
    flushInterval: 3000,
  },
};

const stdoutTarget: TransportTargetOptions = {
  target: 'pino/file',
  level: 'info',
  options: { destination: 1 },
};

console.log('[logger] NODE_ENV:', process.env.NODE_ENV);
console.log('[logger] isProd:', isProd, 'will ship to ES:', isProd && !isTest);
console.log('[logger] ELASTIC_NODE:', env.ELASTIC_NODE ? 'SET' : 'MISSING');
console.log('[logger] ELASTIC_API_KEY:', env.ELASTIC_API_KEY ? 'SET' : 'MISSING');

const transport = (() => {
  if (isTest) return undefined;
  if (isProd) {
    return pino.transport({
      targets: [elasticTarget, stdoutTarget],
    });
  }
  return pino.transport({ targets: [devTarget] });
})();

if (transport) {
  transport.on('error', (err) =>
    process.stderr.write(`[pino-transport] ${err.stack ?? err.message}\n`),
  );
  transport.on('worker:error', (err) =>
    process.stderr.write(`[pino-worker] ${err.stack ?? err.message}\n`),
  );
  transport.on('close', () => process.stderr.write('[pino-transport] closed unexpectedly\n'));
}

export const logger = pino(baseOptions, transport);
