import { defineConfig } from "drizzle-kit";

// Load .env.local safely for local migration commands if DATABASE_URL is not yet set
if (!process.env["DATABASE_URL"]) {
  try {
    process.loadEnvFile?.(".env.local");
  } catch {
    // Ignore if file does not exist (e.g. in CI or deployment)
  }
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/neon_migrations",
  dbCredentials: {
    url: process.env["DATABASE_URL"] || process.env["LOVABLE_DB_MIGRATION_URL"] || "",
  },
});
