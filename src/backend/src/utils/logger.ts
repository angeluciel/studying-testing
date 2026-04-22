import pino, { type LoggerOptions, type TransportTargetOptions } from 'pino';
import { Client } from '@elastic/elasticsearch';
import { Writable } from 'node:stream';
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
  timestamp: () => `,"@timestamp":"${new Date().toISOString()}"`,
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

function createElasticStream(): Writable {
  const client = new Client({
    node: env.ELASTIC_NODE!,
    auth: { apiKey: env.ELASTIC_API_KEY! },
  });

  const indexName = env.ELASTIC_INDEX ?? 'express-logs';

  return new Writable({
    // Parse each JSON line from pino and index it
    write(chunk: Buffer, _encoding, callback) {
      // Always mirror to stdout so logs are visible locally too
      process.stdout.write(chunk);

      try {
        const doc = JSON.parse(chunk.toString());
        client.index({ index: indexName, document: doc }).catch((err: Error) => {
          process.stderr.write(`[es-transport] ${err.message}\n`);
        });
      } catch (err) {
        process.stderr.write(`[es-transport] parse error: ${(err as Error).message}\n`);
      }

      callback();
    },
  });
}

function createLogger() {
  if (isTest) {
    return pino({ ...baseOptions, level: 'silent' });
  }

  if (isProd) {
    return pino(baseOptions, createElasticStream());
  }

  return pino(baseOptions, pino.transport({ targets: [devTarget] }));
}

export const logger = createLogger();
