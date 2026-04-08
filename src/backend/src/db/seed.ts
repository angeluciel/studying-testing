import { pool } from "./pool";
import { createUser } from "../modules/users/users.service";
import { env } from "../config/env";

export async function seedAdminUser() {
    const adminCheck = await pool.query(
        `SELECT id FROM users WHERE role = $1 LIMIT 1`,
        ["admin"]
    );

    if (adminCheck.rows.length > 0) {
        console.log("Admin user already exists, skipping seed.");
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

seedAdminUser()
    .then(async () => {
        await pool.end();
        process.exit(0);
    })
    .catch(async (error) => {
        console.log("Seed failed: ", error);
        await pool.end();
        process.exit(1);
    });