import { runMigrations } from "../db/migrate";
import { pool } from "../db/pool";

export async function setup() {
    await runMigrations();
}

export async function teardown() {
    await pool.end();
}