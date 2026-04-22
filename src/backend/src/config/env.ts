import dotenv from 'dotenv';
import { z } from 'zod';

const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env';
dotenv.config({ path: envFile, quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  APP_BASE_URL: required('APP_BASE_URL'),
  SMTP_HOST: required('SMTP_HOST'),
  SMTP_PORT: z.coerce.number().parse(required('SMTP_PORT')),
  SMTP_USER: required('SMTP_USER'),
  SMTP_PASS: required('SMTP_PASS'),
  MAIL_FROM: required('MAIL_FROM'),
  TEMP_PASSWORD: process.env.TEMP_PASSWORD ?? null,
  ELASTIC_NODE: required('ELASTIC_NODE'),
  ELASTIC_API_KEY: required('ELASTIC_API_KEY'),
  ELASTIC_INDEX: required('ELASTIC_INDEX'),
};
