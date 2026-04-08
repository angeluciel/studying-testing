import dotenv from "dotenv";
import { number } from "zod";

dotenv.config();

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable: ${name}`);
    return value;
}

export const env = {
    PORT: Number(process.env.PORT ?? 3000),
    DATABASE_URL: required("DATABASE_URL"),
    JWT_SECRET: required("JWT_SECRET"),
    APP_BASE_URL: required("APP_BASE_URL"),
    SMTP_HOST: required("SMTP_HOST"),
    SMTP_PORT: number(required("SMTP_PORT")),
    SMTP_USER: required("SMTP_USER"),
    SMTP_PASS: required("SMTP_PASS"),
    MAIL_FROM: required("MAIL_FROM"),
    TEMP_PASSWORD: process.env.TEMP_PASSWORD ?? null
};