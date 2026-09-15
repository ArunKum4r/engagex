// import postgres from "postgres";
// import dotenv from "dotenv";
// import path from "node:path";

// dotenv.config({
//   path: path.resolve(process.cwd(), "../../.env"),
// });

// const sql = postgres(process.env.DATABASE_URL!);

// try {
//   const result = await sql.unsafe(`
//     SELECT table_schema, table_name
//     FROM information_schema.tables
//     WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
//     ORDER BY table_schema, table_name
//   `);

//   console.log(result);
// } catch (error) {
//   console.error(error);
// } finally {
//   await sql.end();
// }

import { db } from "./client.js";
import { sql } from "drizzle-orm";

async function test() {
    try {
        const tables = await db.execute(sql`
            SELECT
                table_schema,
                table_name
            FROM information_schema.tables
            WHERE table_schema NOT IN (
                'pg_catalog',
                'information_schema'
            )
            ORDER BY table_schema, table_name;
        `);

        console.log("TABLES:");
        console.log(tables);

        const migrations = await db.execute(sql`
            SELECT *
            FROM drizzle.__drizzle_migrations
            ORDER BY created_at;
        `);

        console.log("MIGRATIONS:");
        console.log(migrations);
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}

test();