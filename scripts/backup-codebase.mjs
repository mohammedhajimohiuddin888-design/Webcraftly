import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const backupDir = path.resolve("./backups");
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const zipFile = path.join(backupDir, `codebase-backup-${timestamp}.zip`);

console.log("Archiving project codebase (excluding node_modules, .output, .tanstack)...");

// Files and folders to include
const targets = [
  "src",
  "public",
  "drizzle",
  "supabase",
  "scripts",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "components.json",
  "README.md"
];

const targetArgs = targets.map((t) => `"${t}"`).join(", ");
const psCommand = `Compress-Archive -Path ${targetArgs} -DestinationPath "${zipFile}" -Force`;

execSync(`powershell.exe -NoProfile -Command "${psCommand}"`, { stdio: "inherit" });

if (fs.existsSync(zipFile)) {
  const stats = fs.statSync(zipFile);
  console.log(`[✓] Codebase backup created successfully: ${zipFile} (${Math.round(stats.size / 1024)} KB)`);
} else {
  console.error("Backup file was not created.");
  process.exit(1);
}
