import { db, schema, sqlClient } from "../src/lib/db/index.ts";
import { eq } from "drizzle-orm";
import { hashPassword } from "@better-auth/utils/password";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

const adminEmail = "mohammedhajimohiuddin888@gmail.com";
const newPassword = process.argv[2] || "HAJI9346";

async function setAdminPassword() {
  console.log(`\n======================================================================`);
  console.log(`SETTING ADMIN PASSWORD FOR: ${adminEmail}`);
  console.log(`Password: ${newPassword}`);
  console.log(`======================================================================\n`);

  // 1. Find user in Neon DB
  const user = await db.query.user.findFirst({
    where: eq(schema.user.email, adminEmail),
  });

  if (!user) {
    throw new Error(`Admin user not found with email: ${adminEmail}`);
  }

  console.log(`Found user ID: ${user.id}, role: '${user.role}'`);

  // Ensure role is admin
  if (user.role !== "admin") {
    await db
      .update(schema.user)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(schema.user.id, user.id));
    console.log(`Updated user role to 'admin'`);
  }

  // 2. Hash the new password using Better Auth's algorithm
  const hashedPassword = await hashPassword(newPassword);
  console.log(`Computed password hash successfully.`);

  // 3. Find or update account record
  const existingAccount = await db.query.account.findFirst({
    where: eq(schema.account.userId, user.id),
  });

  if (existingAccount) {
    await db
      .update(schema.account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(schema.account.id, existingAccount.id));
    console.log(`[✓] Updated existing account record ID: ${existingAccount.id} with new password.`);
  } else {
    // Insert account record
    const accountId = `acc_${Date.now()}`;
    await db.insert(schema.account).values({
      id: accountId,
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`[✓] Created new credential account record with ID: ${accountId}`);
  }

  console.log(`\n[✓] SUCCESS: Password for ${adminEmail} is now set to '${newPassword}'`);
  await sqlClient.end();
}

try {
  await setAdminPassword();
  process.exit(0);
} catch (err) {
  console.error("Failed to set admin password:", err);
  try {
    await sqlClient.end();
  } catch {}
  process.exit(1);
}
