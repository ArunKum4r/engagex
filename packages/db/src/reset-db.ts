import { db } from "./client.js";
import { sql } from "drizzle-orm";

async function resetDatabase() {
    try {
        await db.execute(
            sql.raw(`
                DROP SCHEMA public CASCADE;
                DROP SCHEMA drizzle CASCADE;

                CREATE SCHEMA public;
                CREATE SCHEMA drizzle;
            `),
        );

        console.log("Database reset successfully");
    } catch (error) {
        console.error("Failed to reset database:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

resetDatabase();