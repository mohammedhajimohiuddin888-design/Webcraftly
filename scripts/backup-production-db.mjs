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
console.log("CREATING PRE-DEPLOYMENT PRODUCTION DATABASE BACKUP");
console.log("======================================================================");
console.log(`Database Host: ${parsedUrl.host}`);
console.log(`Database Name: ${parsedUrl.pathname.replace("/", "")}`);

const backupDir = path.resolve("./backups");
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFilePath = path.join(backupDir, `neondb-backup-${timestamp}.json`);

try {
  const tables = [
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
    "visitor_analytics"
  ];

  const dbBackup = {
    metadata: {
      timestamp: new Date().toISOString(),
      database: parsedUrl.pathname.replace("/", ""),
      host: parsedUrl.host,
      tableCount: tables.length,
    },
    tables: {},
  };

  console.log("\nExporting table snapshots...");
  for (const tableName of tables) {
    const rows = await sql.unsafe(`SELECT * FROM "${tableName}";`);
    dbBackup.tables[tableName] = {
      count: rows.length,
      rows: rows,
    };
    console.log(`[✓] Table '${tableName.padEnd(20)}': ${rows.length} records exported`);
  }

  fs.writeFileSync(backupFilePath, JSON.stringify(dbBackup, null, 2), "utf-8");
  const stats = fs.statSync(backupFilePath);
  console.log(`\n[✓] Backup written successfully to: ${backupFilePath}`);
  console.log(`[✓] Backup File Size: ${Math.round(stats.size / 1024)} KB`);
  console.log("======================================================================\n");
} catch (err) {
  console.error("Backup failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
