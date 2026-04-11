import { pool } from "./pool";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

export async function runMigrations() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            filename TEXT UNIQUE NOT NULL,
            run_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
        const already = await pool.query(
            `SELECT id FROM migrations WHERE filename = $1`,
            [file]
        );
        if (already.rows.length > 0) continue;

        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
        await pool.query(sql);
        await pool.query(`INSERT INTO migrations (filename) VALUES ($1)`, [file]);
        logger.info(`Migration applied: ${file}`);
    }
}