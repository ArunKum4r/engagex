import dotenv from "dotenv";
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
dotenv.config({
    path: path.resolve(process.cwd(), "../../.env"),
});
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}
const client = postgres(connectionString);
export const db = drizzle(client);
