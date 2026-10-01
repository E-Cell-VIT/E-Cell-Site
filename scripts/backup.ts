import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";

async function main() {
  console.log("\n==================================================");
  console.log("  E-Cell VIT Mumbai — Database & Storage Backup");
  console.log("==================================================\n");

  const rootDir = process.cwd();
  const dbPath = path.join(rootDir, "data", "ecell.db");
  const storageDir = path.join(rootDir, "storage");
  const backupsDir = path.join(rootDir, "backups");

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    console.error("❌ Database file not found at ./data/ecell.db. Run 'npm run seed' first.");
    process.exit(1);
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);

  const backupFilename = `ecell-backup-${timestamp}.zip`;
  const backupFilePath = path.join(backupsDir, backupFilename);

  console.log("📦 Creating backup archive...");
  const zip = new AdmZip();

  // 1. Add database file
  console.log("  → Adding ./data/ecell.db");
  zip.addLocalFile(dbPath, "data");

  // 2. Add entire storage folder if exists
  if (fs.existsSync(storageDir)) {
    console.log("  → Adding ./storage folder (public & private uploads)");
    zip.addLocalFolder(storageDir, "storage");
  }

  // 3. Write zip file
  zip.writeZip(backupFilePath);
  const stats = fs.statSync(backupFilePath);
  const sizeKB = (stats.size / 1024).toFixed(1);

  console.log(`\n✅ Backup completed successfully!`);
  console.log(`📁 File: ./backups/${backupFilename}`);
  console.log(`📊 Size: ${sizeKB} KB\n`);
  console.log("⚠️  TIP: Copy this backup to an external drive or secondary storage before major updates.");
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
