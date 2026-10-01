import path from "path";
import fs from "fs";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import AdmZip from "adm-zip";

async function main() {
  console.log("\n==================================================");
  console.log("  E-Cell VIT Mumbai — Database & Storage Restore");
  console.log("==================================================\n");

  const rootDir = process.cwd();
  const backupsDir = path.join(rootDir, "backups");
  const rl = readline.createInterface({ input, output });

  try {
    let targetZip = process.argv[2];

    if (!targetZip) {
      if (!fs.existsSync(backupsDir)) {
        console.log("❌ No backups folder found.");
        process.exit(1);
      }

      const files = fs
        .readdirSync(backupsDir)
        .filter((f) => f.endsWith(".zip"))
        .sort()
        .reverse();

      if (files.length === 0) {
        console.log("❌ No backup zip files found in ./backups/.");
        process.exit(1);
      }

      console.log("Available backups in ./backups/:");
      files.forEach((f, idx) => console.log(`  [${idx + 1}] ${f}`));

      const choice = await rl.question("\nEnter backup number to restore [1]: ");
      const index = choice.trim() ? parseInt(choice.trim(), 10) - 1 : 0;

      if (isNaN(index) || index < 0 || index >= files.length) {
        console.log("❌ Invalid selection.");
        process.exit(1);
      }

      targetZip = path.join(backupsDir, files[index]);
    } else {
      if (!path.isAbsolute(targetZip)) {
        targetZip = path.join(rootDir, targetZip);
      }
    }

    if (!fs.existsSync(targetZip)) {
      console.log(`❌ Backup archive not found at: ${targetZip}`);
      process.exit(1);
    }

    console.log(`\nSelected archive: ${path.basename(targetZip)}`);
    console.log("⚠️  WARNING: Restoring will overwrite the current ./data/ecell.db and ./storage/ folder!");

    const confirm = await rl.question("Type 'YES' to confirm and proceed: ");
    if (confirm.trim() !== "YES") {
      console.log("Restore operation aborted by user.");
      process.exit(0);
    }

    console.log("\nExtracting backup archive...");
    const zip = new AdmZip(targetZip);
    zip.extractAllTo(rootDir, true);

    console.log("\n✅ Database and storage restored successfully!");
    console.log("Please restart your development server ('npm run dev') if it was running.\n");
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error("Restore failed:", err);
  process.exit(1);
});
