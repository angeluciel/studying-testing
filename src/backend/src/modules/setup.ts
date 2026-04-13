import { beforeEach, afterAll } from "vitest";
import { getTestPool } from "../db/testContainers";
import { inject } from "vitest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = inject("DATABASE_URL");

beforeEach(async () => {
    const { pool } = await import("../db/pool.js")
    const { resetDatabase } = await import ("../db/resetDatabase.js");
    await resetDatabase(pool);
});

afterAll(async () => {
    const { pool } = await import("../db/pool.js");
    await pool.end;
})

export { getTestPool };
