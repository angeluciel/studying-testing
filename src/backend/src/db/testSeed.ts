import bcrypt from "bcrypt";
import { env } from "../config/env";
import { pool } from "./pool";

function assertTestEnvironment() {
    if (env.NODE_ENV !== "test") {
        throw new Error(
            `🚨 resetDb() called outside test environment! Current NODE_ENV: ${env.NODE_ENV}`
        );
    }
    if (!env.DATABASE_URL.includes("localhost") && !env.DATABASE_URL.includes("127.0.0.1")) {
        throw new Error(
            `🚨 resetDb() is pointing at a non-local database! URL: ${env.DATABASE_URL}`
        );
    }
}


export async function resetDb() {
    assertTestEnvironment();
    await pool.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
}

export async function seedTestAdmin() {
    const password_hash = await bcrypt.hash("password", 10);
    await pool.query(
        `
        INSERT INTO users (email, name, surname, password_hash, role)
        VALUES ('admin@test.com', 'test', 'Admin', $1, 'admin')
        `,
        [password_hash]
    );
}
