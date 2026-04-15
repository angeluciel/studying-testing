import { pool } from "./pool";
import { seedAdminUser } from "./seed";

async function main() {
    await seedAdminUser();
    await pool.end();
}

main().catch(async (err) => {
    console.error("Seed failed:", err);
    await pool.end();
    process.exit(1);
})