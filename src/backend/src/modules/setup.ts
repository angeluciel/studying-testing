import { beforeEach, afterAll } from "vitest";
import { pool } from "../db/pool";
import { resetDb } from "../db/testSeed";

beforeEach(async () => {
    await resetDb();
});

afterAll(async () => {
    await pool.end();
});
