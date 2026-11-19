import { db, schema, sqlClient } from "../src/lib/db/index.ts";
import { auth } from "../src/lib/auth/index.ts";
import { eq } from "drizzle-orm";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

const adminEmail = process.argv[2] || "mohammedhajimohiuddin888@gmail.com";
const adminName = process.argv[3] || "Mohammed Haji Mohiuddin";
const adminPassword = process.env.ADMIN_PASSWORD || process.argv[4] || "Admin@WebCraftly2026!";

async function provisionAdmin() {
  console.log(`\n======================================================================`);
  console.log(`PROVISIONING ADMIN: ${adminEmail}`);
  console.log(`======================================================================\n`);

  // 1. Check if user already exists
  const existing = await db.query.user.findFirst({
    where: eq(schema.user.email, adminEmail),
  });

  if (existing) {
    console.log(`User already exists with ID: ${existing.id}, current role: '${existing.role}'`);
    if (existing.role !== "admin") {
      console.log(`Promoting to 'admin'...`);
      await db
        .update(schema.user)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(schema.user.id, existing.id));
    }
  } else {
    console.log(`Creating user through Better Auth...`);
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      },
    });

    if (!signUpResult?.user?.id) {
      throw new Error(`Better Auth sign-up failed: ${JSON.stringify(signUpResult)}`);
    }

    console.log(`Created user ID: ${signUpResult.user.id}. Setting role to 'admin'...`);
    await db
      .update(schema.user)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(schema.user.id, signUpResult.user.id));
  }

  // Verify in Neon PostgreSQL
  const verified = await db.query.user.findFirst({
    where: eq(schema.user.email, adminEmail),
  });

  if (!verified || verified.role !== "admin") {
    throw new Error(`Verification failed! Role is '${verified?.role}'`);
  }

  console.log(`[✓] SUCCESS: Verified admin in Neon PostgreSQL!`);
  console.log(`  Name:  ${verified.name}`);
  console.log(`  Email: ${verified.email}`);
  console.log(`  Role:  ${verified.role}`);
  console.log(`======================================================================\n`);

  await sqlClient.end();
}

try {
  await provisionAdmin();
  process.exit(0);
} catch (err) {
  console.error("Provisioning failed:", err);
  try {
    await sqlClient.end();
  } catch {}
  process.exit(1);
}
