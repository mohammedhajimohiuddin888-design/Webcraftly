/**
 * Production Migration Script for WebCraftly Neon Database (neondb)
 *
 * Steps:
 * 1. Confirms target database is 'neondb'.
 * 2. Takes pre-migration snapshot state.
 * 3. Applies verified Neon migration (drizzle/neon_migrations/0000_charming_war_machine.sql) in transaction.
 * 4. Runs dynamic catalog assertions against production neondb.
 */

import fs from "node:fs";
import path from "node:path";
import postgresModule from "postgres";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

const prodUrl = process.env.DATABASE_URL || process.env.LOVABLE_DB_MIGRATION_URL;
if (!prodUrl) {
  console.error("FATAL: DATABASE_URL is not set.");
  process.exit(1);
}

const parsedUrl = new URL(prodUrl);
if (parsedUrl.pathname !== "/neondb") {
  console.error(`FATAL: Expected target database '/neondb', but got '${parsedUrl.pathname}'`);
  process.exit(1);
}

const postgres = postgresModule.default || postgresModule;
const sql = postgres(prodUrl, { ssl: "require", max: 2, prepare: false });

console.log("\n======================================================================");
console.log("APPLYING VERIFIED NEON MIGRATION TO PRODUCTION NEONDB");
console.log("======================================================================");
console.log(`Target Host: ${parsedUrl.host}`);
console.log(`Target Database: ${parsedUrl.pathname}`);

try {
  // Step 1: Pre-migration inspection
  console.log("\nStep 1: Inspecting pre-migration production state...");
  const preTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  `;
  console.log(`Pre-migration table count in 'public': ${preTables.length}`);

  // Step 2: Read verified migration SQL
  console.log("\nStep 2: Loading verified migration file from drizzle/neon_migrations/...");
  const migrationPath = path.resolve("./drizzle/neon_migrations/0000_charming_war_machine.sql");
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found at ${migrationPath}`);
  }

  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  const statements = migrationSql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Found ${statements.length} migration statements.`);

  // Step 3: Apply in transaction
  console.log("\nStep 3: Executing migration in transaction on production neondb...");
  await sql.begin(async (tx) => {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      await tx.unsafe(stmt);
    }
  });
  console.log("[PASS] All migration statements committed successfully to neondb!");

  // Step 4: Dynamic catalog verification on production
  console.log("\nStep 4: Running Dynamic Catalog Verification on production neondb...");

  const expectedTables = [
    "user",
    "session",
    "account",
    "verification",
    "customers",
    "services",
    "service_packages",
    "service_addons",
    "gallery_themes",
    "orders",
    "payments",
    "service_inquiries",
    "project_attachments",
    "visitor_analytics",
  ];

  const prodTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  const actualNames = prodTables.map((r) => r.table_name);

  console.log(`\n-> Verifying 14 Tables in production neondb:`);
  let missingCount = 0;
  for (const t of expectedTables) {
    if (actualNames.includes(t)) {
      console.log(`   [✓] Table '${t}' exists`);
    } else {
      console.log(`   [✗] Table '${t}' is MISSING`);
      missingCount++;
    }
  }

  if (missingCount > 0 || actualNames.length !== expectedTables.length) {
    throw new Error(`Table count mismatch! Expected ${expectedTables.length}, found ${actualNames.length}`);
  }
  console.log("[PASS] Exactly 14 production tables verified in neondb!");

  // Verify service_inquiries.customer_id NOT NULL
  const inqCol = await sql`
    SELECT is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'service_inquiries' AND column_name = 'customer_id';
  `;
  if (inqCol.length === 0 || inqCol[0].is_nullable !== "NO") {
    throw new Error("service_inquiries.customer_id is not NOT NULL in production!");
  }
  console.log("[PASS] service_inquiries.customer_id is NOT NULL in production.");

  // Verify partial unique index on customers.user_id
  const partialIdx = await sql`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename = 'customers' AND indexname = 'customers_user_id_unique_idx';
  `;
  if (partialIdx.length === 0 || !partialIdx[0].indexdef.includes("WHERE (user_id IS NOT NULL)")) {
    throw new Error("Partial unique index on customers.user_id is missing or invalid in production!");
  }
  console.log("[PASS] customers_user_id_unique_idx (partial unique index) verified in production.");

  // Verify CHECK constraints
  const checkConstraints = await sql`
    SELECT tc.table_name, tc.constraint_name, cc.check_clause
    FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_name;
  `;
  console.log(`\n-> Verifying CHECK constraints (${checkConstraints.length} active in production):`);
  const requiredChecks = [
    "payments_positive_amount_check",
    "payments_type_check",
    "payments_reversal_ref_check",
    "attachment_exclusive_parent_check",
  ];
  for (const rc of requiredChecks) {
    const found = checkConstraints.find((c) => c.constraint_name === rc);
    if (!found) throw new Error(`Missing required CHECK constraint: ${rc}`);
    console.log(`   [✓] ${rc}: ${found.check_clause}`);
  }
  console.log("[PASS] All required CHECK constraints verified in production.");

  // Verify Foreign Keys
  const foreignKeys = await sql`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
  `;

  const paymentsOrderFk = foreignKeys.find((f) => f.table_name === "payments" && f.column_name === "order_id");
  if (!paymentsOrderFk || paymentsOrderFk.delete_rule !== "RESTRICT") {
    throw new Error("payments.order_id foreign key is not RESTRICT in production!");
  }

  const paymentsRevFk = foreignKeys.find((f) => f.table_name === "payments" && f.column_name === "reversal_of_payment_id");
  if (!paymentsRevFk || paymentsRevFk.delete_rule !== "RESTRICT") {
    throw new Error("payments.reversal_of_payment_id foreign key is not RESTRICT in production!");
  }

  const ordersCustFk = foreignKeys.find((f) => f.table_name === "orders" && f.column_name === "customer_id");
  if (!ordersCustFk || ordersCustFk.delete_rule !== "RESTRICT") {
    throw new Error("orders.customer_id foreign key is not RESTRICT in production!");
  }

  const inqCustFk = foreignKeys.find((f) => f.table_name === "service_inquiries" && f.column_name === "customer_id");
  if (!inqCustFk || inqCustFk.delete_rule !== "RESTRICT") {
    throw new Error("service_inquiries.customer_id foreign key is not RESTRICT in production!");
  }
  console.log("[PASS] All ON DELETE RESTRICT policies confirmed on production foreign keys.");

  console.log("\n======================================================================");
  console.log("PRODUCTION MIGRATION COMPLETED AND 100% VERIFIED ON NEONDB!");
  console.log("======================================================================\n");
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
} finally {
  await sql.end({ timeout: 3 });
}
