import { db, schema } from "../src/lib/db/index.ts";
import { eq } from "drizzle-orm";
import { hashPassword } from "@better-auth/utils/password";
import crypto from "crypto";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

const ADMINS_TO_PROVISION = [
  {
    email: "mohammedhajimohiuddin888@gmail.com",
    name: "Mohammed Haji Mohiuddin",
    password: "HAJI9346",
  },
  {
    email: "mdausafmohiuddin@gmail.com",
    name: "Md Ausaf Mohiuddin",
    password: "HAJI9346",
  },
  {
    email: "rizwanalisyed552@gmail.com",
    name: "Rizwan Ali Syed",
    password: "HAJI9346",
  },
];

async function provisionAllAdmins() {
  console.log("======================================================================");
  console.log("PROVISIONING ADMINISTRATOR ACCOUNTS IN NEON POSTGRESQL");
  console.log("======================================================================\n");

  for (const admin of ADMINS_TO_PROVISION) {
    const cleanEmail = admin.email.trim().toLowerCase();
    console.log(`Processing admin: ${cleanEmail}...`);

    let user = await db.query.user.findFirst({
      where: eq(schema.user.email, cleanEmail),
    });

    if (user) {
      console.log(`  User exists (ID: ${user.id}). Updating role to 'admin'...`);
      await db
        .update(schema.user)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(schema.user.id, user.id));
    } else {
      const newUserId = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
      console.log(`  User does not exist. Creating new admin user (ID: ${newUserId})...`);
      await db.insert(schema.user).values({
        id: newUserId,
        name: admin.name,
        email: cleanEmail,
        role: "admin",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      user = await db.query.user.findFirst({
        where: eq(schema.user.email, cleanEmail),
      });
    }

    if (!user) {
      throw new Error(`Failed to create or retrieve user for ${cleanEmail}`);
    }

    // Hash the password "HAJI9346"
    const hashedPassword = await hashPassword(admin.password);

    const existingAccount = await db.query.account.findFirst({
      where: eq(schema.account.userId, user.id),
    });

    if (existingAccount) {
      console.log(`  Account exists (ID: ${existingAccount.id}). Updating password hash...`);
      await db
        .update(schema.account)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(schema.account.id, existingAccount.id));
    } else {
      const newAccId = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
      console.log(`  Account record not found. Inserting new credential account (ID: ${newAccId})...`);
      await db.insert(schema.account).values({
        id: newAccId,
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`  ✓ Admin ${cleanEmail} configured with role 'admin' and password 'HAJI9346'!\n`);
  }

  console.log("All administrators successfully provisioned in database!");
  process.exit(0);
}

provisionAllAdmins().catch((err) => {
  console.error("Provisioning failed:", err);
  process.exit(1);
});
