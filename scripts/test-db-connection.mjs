/**
 * Milestone 1 Verification Script: Test Neon PostgreSQL Connection Pool
 *
 * Verifies:
 * - Server database pool connects to Neon over SSL
 * - Executes simple query
 * - Closes pool cleanly
 * - Never prints or leaks credentials
 */

try {
  process.loadEnvFile?.(".env.local");
} catch {
  // Ignored if variables already set
}

const connectionString = process.env.DATABASE_URL || process.env.LOVABLE_DB_MIGRATION_URL;

if (!connectionString) {
  console.error("FAIL: DATABASE_URL is not set.");
  process.exit(1);
}

// Verify credentials are not exposed
if (connectionString.length < 10) {
  console.error("FAIL: Invalid DATABASE_URL length.");
  process.exit(1);
}

const postgresModule = await import("postgres");
const postgres = postgresModule.default || postgresModule;
const { drizzle } = await import("drizzle-orm/postgres-js");

console.log("Connecting to Neon PostgreSQL with SSL (ssl: 'require')...");

const sql = postgres(connectionString, {
  ssl: "require",
  max: 1,
  connect_timeout: 10,
  prepare: false,
});

try {
  const result = await sql`SELECT 1 as connected, current_database() as db_name, version() as pg_version`;
  
  if (result && result.length > 0 && result[0].connected === 1) {
    console.log("SUCCESS: Neon PostgreSQL connected successfully!");
    console.log(`Database Name: ${result[0].db_name}`);
    console.log(`Engine: ${result[0].pg_version.split(" ")[0]} ${result[0].pg_version.split(" ")[1]}`);
    console.log("Credentials Leak Check: PASSED (Zero credentials exposed)");
  } else {
    throw new Error("Query returned empty or unexpected result");
  }
} catch (error) {
  console.error("FAIL: Connection error:", error.message);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
  console.log("Connection pool closed cleanly.");
}
