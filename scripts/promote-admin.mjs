/**
 * WebCraftly: Admin Account Provisioning & Role Promotion CLI
 *
 * Usage:
 *   node scripts/promote-admin.mjs <email>
 *   npm run admin:promote <email>
 *
 * Actions:
 *   1. Looks up the user in Neon PostgreSQL.
 *   2. If the user exists, promotes role to 'admin' and verifies directly in Neon.
 *   3. If the user does not exist, interactively prompts to create a new admin account.
 *   4. Zero credential or password leakage in logs or terminal.
 */

import readline from "node:readline";
import { db, schema, sqlClient } from "../src/lib/db/index.ts";
import { auth } from "../src/lib/auth/index.ts";
import { eq } from "drizzle-orm";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function promptText(question) {
  return new Promise((resolve) => {
    const rl = createInterface();
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    let password = "";

    const isRaw = stdin.isRaw;
    if (stdin.setRawMode) stdin.setRawMode(true);
    stdin.resume();

    const onData = (chunk) => {
      const char = chunk.toString("utf8");
      for (const c of char) {
        if (c === "\r" || c === "\n" || c === "\u0004") {
          if (stdin.setRawMode) stdin.setRawMode(isRaw || false);
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(password);
          return;
        } else if (c === "\u0003") {
          // Ctrl+C
          process.stdout.write("\n");
          process.exit(1);
        } else if (c === "\u007f" || c === "\b") {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else {
          password += c;
          process.stdout.write("*");
        }
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  console.log("\n======================================================================");
  console.log("WEBCRAFTLY: ADMIN ACCOUNT PROVISIONING & PROMOTION TOOL");
  console.log("======================================================================\n");

  let email = (process.argv[2] || "").trim().toLowerCase();

  if (!email) {
    if (!process.stdin.isTTY) {
      console.error("ERROR: Please specify an email address:");
      console.error("  Usage: npm run admin:promote <email>");
      process.exit(1);
    }
    email = (await promptText("Enter the email address of the account to promote: ")).toLowerCase();
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    console.error(`ERROR: Invalid email format: '${email}'`);
    process.exit(1);
  }

  console.log(`\nConnecting to Neon PostgreSQL to check user: ${email}...`);

  // 1. Look up user in Neon PostgreSQL
  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
  });

  if (existingUser) {
    console.log(`\nFound existing account:`);
    console.log(`  Name: ${existingUser.name}`);
    console.log(`  User ID: ${existingUser.id}`);
    console.log(`  Current Role: ${existingUser.role}`);

    if (existingUser.role === "admin") {
      console.log(`\n[✓] User '${email}' is ALREADY an administrator in Neon.`);
      console.log("No changes needed.");
      await sqlClient.end();
      process.exit(0);
    }

    // Promote existing user to admin
    console.log(`\nPromoting '${email}' from '${existingUser.role}' to 'admin'...`);
    await db
      .update(schema.user)
      .set({
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, existingUser.id));

    // Verify directly in Neon
    const verified = await db.query.user.findFirst({
      where: eq(schema.user.id, existingUser.id),
    });

    if (!verified || verified.role !== "admin") {
      throw new Error(`CRITICAL: Verification in Neon DB failed! Role is '${verified?.role}'`);
    }

    console.log(`\n======================================================================`);
    console.log(`[✓] SUCCESS: User promoted to administrator!`);
    console.log(`  Email:    ${verified.email}`);
    console.log(`  User ID:  ${verified.id}`);
    console.log(`  Role:     ${verified.role}`);
    console.log(`  Verified: Neon PostgreSQL 'user' table`);
    console.log(`======================================================================\n`);

    await sqlClient.end();
    process.exit(0);
  }

  // 2. User does not exist in Neon
  console.log(`\nUser '${email}' was not found in Neon database.`);

  const canPrompt = process.stdin.isTTY;
  const envPassword = process.env.ADMIN_PASSWORD;

  if (!canPrompt && !envPassword) {
    console.log("\nTo promote an account, you can either:");
    console.log("  1. Register first on the WebCraftly website at http://localhost:8080/account");
    console.log("     then run: npm run admin:promote " + email);
    console.log("  2. Or run this command interactively in your terminal to create it now.");
    await sqlClient.end();
    process.exit(1);
  }

  console.log("\nWould you like to create and provision this admin account now?");
  if (canPrompt) {
    const confirm = (await promptText("Create new admin account? (y/N): ")).toLowerCase();
    if (confirm !== "y" && confirm !== "yes") {
      console.log("Aborted. No account was created.");
      await sqlClient.end();
      process.exit(0);
    }
  }

  let name = "WebCraftly Administrator";
  if (canPrompt) {
    const inputName = await promptText("Enter Admin Full Name [WebCraftly Administrator]: ");
    if (inputName) name = inputName;
  }

  let password = envPassword || "";
  if (!password && canPrompt) {
    password = await promptPassword("Enter a secure password for this admin account (min 8 characters): ");
    if (password.length < 8) {
      console.error("\nERROR: Password must be at least 8 characters long.");
      await sqlClient.end();
      process.exit(1);
    }
    const confirmPw = await promptPassword("Confirm password: ");
    if (password !== confirmPw) {
      console.error("\nERROR: Passwords do not match.");
      await sqlClient.end();
      process.exit(1);
    }
  }

  if (!password || password.length < 8) {
    console.error("ERROR: Valid password required (min 8 characters).");
    await sqlClient.end();
    process.exit(1);
  }

  console.log(`\nRegistering account '${email}' via Better Auth...`);
  const signUpResult = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  if (!signUpResult || !signUpResult.user?.id) {
    throw new Error(`Failed to create account through Better Auth: ${JSON.stringify(signUpResult)}`);
  }

  const userId = signUpResult.user.id;
  console.log(`Account registered. Promoting to 'admin' in Neon PostgreSQL...`);

  await db
    .update(schema.user)
    .set({
      role: "admin",
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, userId));

  // Directly verify in Neon
  const verified = await db.query.user.findFirst({
    where: eq(schema.user.id, userId),
  });

  if (!verified || verified.role !== "admin") {
    throw new Error(`CRITICAL: Verification in Neon DB failed! Role is '${verified?.role}'`);
  }

  console.log(`\n======================================================================`);
  console.log(`[✓] SUCCESS: Admin account created and verified!`);
  console.log(`  Name:     ${verified.name}`);
  console.log(`  Email:    ${verified.email}`);
  console.log(`  User ID:  ${verified.id}`);
  console.log(`  Role:     ${verified.role}`);
  console.log(`  Verified: Neon PostgreSQL 'user' table`);
  console.log(`======================================================================\n`);

  await sqlClient.end();
  process.exit(0);
}

try {
  await main();
} catch (error) {
  console.error("\nFAILED TO PROVISION ADMIN:", error.message || error);
  try {
    await sqlClient.end();
  } catch {}
  process.exit(1);
}
