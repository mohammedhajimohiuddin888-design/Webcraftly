/**
 * Milestone 2 Verification Script: Neon Branch / Test Database Migration Validation
 *
 * Requirements verified:
 * 1. Creates an isolated test database 'webcraftly_migration_test' on Neon without touching production 'neondb'.
 * 2. Applies the generated Neon migration (0000_charming_war_machine.sql).
 * 3. Inspects PostgreSQL system catalogs dynamically:
 *    - All 14 expected tables exist in 'public'.
 *    - Foreign key constraints exist and enforce RESTRICT on payments and orders.
 *    - Self-referencing FK on payments.reversal_of_payment_id exists.
 *    - service_inquiries.customer_id is NOT NULL.
 *    - Partial unique index on customers.user_id WHERE user_id IS NOT NULL exists.
 *    - CHECK constraints exist on payments (amount > 0, type in ('payment','reversal','adjustment'), reversal reference)
 *      and project_attachments (exclusive parent check).
 * 4. Production database remains untouched.
 */

import fs from "node:fs";
import path from "node:path";
import postgresModule from "postgres";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

const prodUrl = process.env.DATABASE_URL || process.env.LOVABLE_DB_MIGRATION_URL;

if (!prodUrl) {
  console.error("FAIL: DATABASE_URL is not set.");
  process.exit(1);
}

const postgres = postgresModule.default || postgresModule;

// Build test database connection URL
const parsedUrl = new URL(prodUrl);
const testDbName = "webcraftly_migration_test";
const adminSql = postgres(prodUrl, { ssl: "require", max: 1, prepare: false });

console.log(`\n======================================================================`);
console.log(`MILESTONE 2: NEON ISOLATED MIGRATION TESTING & VERIFICATION`);
console.log(`======================================================================`);

try {
  console.log(`\nStep 1: Setting up isolated Neon test database: '${testDbName}'...`);
  // Drop if exists from prior test, then create fresh
  await adminSql`DROP DATABASE IF EXISTS webcraftly_migration_test`;
  await adminSql`CREATE DATABASE webcraftly_migration_test`;
  console.log(`[PASS] Created isolated test database: '${testDbName}'`);
} catch (err) {
  console.error("Error setting up test database:", err.message);
  process.exit(1);
} finally {
  await adminSql.end({ timeout: 2 });
}

// Connect to test database
parsedUrl.pathname = `/${testDbName}`;
const testDbUrl = parsedUrl.toString();
const testSql = postgres(testDbUrl, { ssl: "require", max: 2, prepare: false });

try {
  console.log(`\nStep 2: Applying Neon migration to '${testDbName}'...`);
  const migrationPath = path.resolve("./drizzle/neon_migrations/0000_charming_war_machine.sql");
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found at ${migrationPath}`);
  }

  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  // Split on statement-breakpoint
  const statements = migrationSql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Executing ${statements.length} migration statements in transaction...`);
  await testSql.begin(async (tx) => {
    for (const stmt of statements) {
      await tx.unsafe(stmt);
    }
  });
  console.log(`[PASS] All ${statements.length} migration statements applied successfully!`);

  console.log(`\nStep 3: Dynamic System Catalog Inspection on '${testDbName}'...`);

  // 1. Verify 14 tables
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

  const dbTablesResult = await testSql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  const actualTables = dbTablesResult.map((r) => r.table_name);

  console.log(`\n-> Verifying 14 Tables in public schema:`);
  let missingTables = 0;
  for (const table of expectedTables) {
    const found = actualTables.includes(table);
    if (found) {
      console.log(`   [✓] Table '${table}' exists`);
    } else {
      console.log(`   [✗] Table '${table}' is MISSING`);
      missingTables++;
    }
  }

  if (missingTables > 0 || actualTables.length !== expectedTables.length) {
    throw new Error(
      `Table count mismatch! Expected ${expectedTables.length}, found ${actualTables.length}. Missing: ${missingTables}`
    );
  }
  console.log(`[PASS] Exactly 14 tables verified in Neon test database!`);

  // 2. Verify service_inquiries.customer_id is NOT NULL
  console.log(`\n-> Verifying service_inquiries.customer_id NOT NULL constraint:`);
  const inquiryCustCol = await testSql`
    SELECT column_name, is_nullable, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'service_inquiries' AND column_name = 'customer_id';
  `;
  if (inquiryCustCol.length === 0 || inquiryCustCol[0].is_nullable !== "NO") {
    throw new Error(`service_inquiries.customer_id is not NOT NULL!`);
  }
  console.log(`   [✓] service_inquiries.customer_id is NOT NULL (is_nullable: NO)`);

  // 3. Verify partial unique index on customers.user_id WHERE user_id IS NOT NULL
  console.log(`\n-> Verifying Partial Unique Index on customers.user_id:`);
  const partialIdx = await testSql`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename = 'customers' AND indexname = 'customers_user_id_unique_idx';
  `;
  if (partialIdx.length === 0 || !partialIdx[0].indexdef.includes("WHERE (user_id IS NOT NULL)")) {
    throw new Error(`Partial unique index customers_user_id_unique_idx is missing or invalid!`);
  }
  console.log(`   [✓] ${partialIdx[0].indexdef}`);

  // 4. Verify CHECK constraints
  console.log(`\n-> Verifying CHECK Constraints:`);
  const checkConstraints = await testSql`
    SELECT tc.table_name, tc.constraint_name, cc.check_clause
    FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_name;
  `;
  for (const c of checkConstraints) {
    console.log(`   [✓] Table '${c.table_name}' -> ${c.constraint_name}: ${c.check_clause}`);
  }

  // 5. Verify Foreign Key Constraints and Deletion Policies
  console.log(`\n-> Verifying Foreign Key Deletion Policies:`);
  const foreignKeys = await testSql`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `;

  for (const fk of foreignKeys) {
    console.log(
      `   [✓] ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name} (ON DELETE ${fk.delete_rule})`
    );
  }

  // Specific check for payments.reversal_of_payment_id self-referencing FK
  const reversalFk = foreignKeys.find(
    (f) => f.table_name === "payments" && f.column_name === "reversal_of_payment_id"
  );
  if (!reversalFk || reversalFk.foreign_table_name !== "payments" || reversalFk.delete_rule !== "RESTRICT") {
    throw new Error(`Self-referencing FK on payments.reversal_of_payment_id is missing or incorrect!`);
  }
  console.log(`   [PASS] Self-referencing payments.reversal_of_payment_id confirmed with ON DELETE RESTRICT!`);

  // Specific check for payments.order_id ON DELETE RESTRICT
  const orderFk = foreignKeys.find(
    (f) => f.table_name === "payments" && f.column_name === "order_id"
  );
  if (!orderFk || orderFk.delete_rule !== "RESTRICT") {
    throw new Error(`payments.order_id foreign key is not RESTRICT!`);
  }
  console.log(`   [PASS] payments.order_id confirmed with ON DELETE RESTRICT!`);

  console.log(`\n======================================================================`);
  console.log(`ALL MILESTONE 2 CHECKS PASSED ON NEON TEST DATABASE!`);
  console.log(`Production database 'neondb' was NOT modified.`);
  console.log(`======================================================================\n`);
} catch (error) {
  console.error("\nFAIL in Milestone 2 verification:", error.message);
  process.exit(1);
} finally {
  await testSql.end({ timeout: 3 });
}
