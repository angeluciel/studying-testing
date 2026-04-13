declare module "vitest" {
    export interface ProvidedContext {
        DATABASE_URL: string;
        SMTP_HOST: string;
        SMTP_PORT: string;
        MAILPIT_UI_PORT: string;
    }
}

export {};