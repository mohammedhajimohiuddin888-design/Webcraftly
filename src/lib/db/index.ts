import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../../../drizzle/schema.ts";

// Load .env.local in local server-side environment if DATABASE_URL is not yet set
if (!process.env["DATABASE_URL"]) {
  try {
    process.loadEnvFile?.(".env.local");
  } catch {
    // Expected when running in production or CI where environment variables are injected directly
  }
}

const connectionString = process.env["DATABASE_URL"] || process.env["LOVABLE_DB_MIGRATION_URL"];

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Please provide a valid Neon PostgreSQL connection string in .env.local");
}

// Global cache for connection pool in development to prevent connection exhaustion during Vite SSR reloads
const globalForDb = globalThis as unknown as {
  sqlClient?: postgres.Sql;
};

export const sqlClient =
  globalForDb.sqlClient ??
  postgres(connectionString, {
    ssl: "require",
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30,
    prepare: false, // Essential for Neon serverless connection pooling
  });

if (process.env["NODE_ENV"] !== "production") {
  globalForDb.sqlClient = sqlClient;
}

export const db = drizzle(sqlClient, { schema });
export { schema };
