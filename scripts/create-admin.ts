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
    return { valid: false, reason: "Password must contain at least one uppercase letter (A-Z)." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one lowercase letter (a-z)." };
  }
  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one number or special symbol." };
  }
  return { valid: true };
}

async function main() {
  console.log("\n==================================================");
  console.log("  E-Cell VIT Mumbai — Create Administrator Account");
  console.log("==================================================\n");

  const rl = readline.createInterface({ input, output });

  try {
    let email = "";
    while (!email || !email.includes("@")) {
      email = (await rl.question("Enter Admin Email: ")).trim().toLowerCase();
      if (!email.includes("@")) {
        console.log("❌ Please enter a valid email address.");
      }
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      console.log(`❌ An admin user with email '${email}' already exists.`);
      process.exit(1);
    }

    let name = "";
    while (!name) {
      name = (await rl.question("Enter Admin Full Name: ")).trim();
      if (!name) {
        console.log("❌ Name cannot be empty.");
      }
    }

    let password = "";
    while (true) {
      password = await rl.question("Enter Strong Password: ");
      const strength = validatePasswordStrength(password);
      if (!strength.valid) {
        console.log(`❌ Weak password: ${strength.reason}`);
        console.log("   Requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 number/symbol.\n");
      } else {
        const confirm = await rl.question("Confirm Password: ");
        if (password !== confirm) {
          console.log("❌ Passwords do not match. Please try again.\n");
        } else {
          break;
        }
      }
    }

    const roleInput = (await rl.question("Role (super_admin / editor) [default: super_admin]: "))
      .trim()
      .toLowerCase();
    const role = roleInput === "editor" ? "editor" : "super_admin";

    console.log("\nHashing password securely with bcrypt...");
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.adminUser.create({
      data: {
        email,
        name,
        passwordHash,
        role,
        active: true,
        mustChangePassword: false,
      },
    });

    console.log("\n✅ Administrator created successfully!");
    console.log(`   ID:    ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role:  ${user.role}`);
    console.log(`   Name:  ${user.name}\n`);
    console.log("You can now login at http://localhost:3000/admin/login\n");
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Error creating admin:", err);
  process.exit(1);
});
