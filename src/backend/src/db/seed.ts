import { pool } from "./pool";
import { createUser } from "../modules/users/users.service";
import { env } from "../config/env";

export async function seedAdminUser() {
    const existing = await pool.query(
        `SELECT id FROM users WHERE email = $1 LIMIT 1`,
        ["admin@example.com"]
    );

    if (existing.rows.length > 0) {
        return;
    }

    if (!env.TEMP_PASSWORD) {
        throw new Error("TEMP_PASSWORD must exist")
    }

    await createUser({
        email: "admin@example.com",
        name: "Main",
        surname: "Admin",
        password: env.TEMP_PASSWORD,
        role: "admin",
    });

    console.log("Initial admin user created successfully.")
}