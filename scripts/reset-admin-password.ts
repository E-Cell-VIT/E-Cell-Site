import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one number or special character." };
  }
  return { valid: true };
}

async function main() {
  console.log("\n==================================================");
  console.log("  E-Cell VIT Mumbai — Reset Admin Password CLI");
  console.log("==================================================\n");

  const rl = readline.createInterface({ input, output });

  try {
    const email = (await rl.question("Enter Admin Email to reset: ")).trim().toLowerCase();
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin) {
      console.log(`❌ No admin account found with email '${email}'.`);
      process.exit(1);
    }

    console.log(`Found account: ${admin.name} (Role: ${admin.role}, Active: ${admin.active})`);

    let newPassword = "";
    while (true) {
      newPassword = await rl.question("Enter New Strong Password: ");
      const strength = validatePasswordStrength(newPassword);
      if (!strength.valid) {
        console.log(`❌ Weak password: ${strength.reason}\n`);
      } else {
        const confirm = await rl.question("Confirm New Password: ");
        if (newPassword !== confirm) {
          console.log("❌ Passwords do not match. Please try again.\n");
        } else {
          break;
        }
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.adminUser.update({
      where: { email },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        active: true,
        mustChangePassword: false,
      },
    });

    console.log("\n✅ Password reset successfully!");
    console.log(`Account for ${email} is active and ready to log in.`);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Error resetting password:", err);
  process.exit(1);
});
