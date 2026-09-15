import { db } from "./client.js";

async function testConnection() {
  try {
    await db.execute("SELECT 1");
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
    process.exit(1);
  }
}

testConnection();