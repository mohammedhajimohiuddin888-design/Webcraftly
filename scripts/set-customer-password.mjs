import { db, schema } from "../src/lib/db/index.ts";
import { eq } from "drizzle-orm";
import { hashPassword } from "@better-auth/utils/password";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

async function setCustomerPassword() {
  const email = "hajimohiuddin1@gmail.com";
  const newPassword = "HAJI9346";

  console.log(`Setting password for ${email} to ${newPassword}...`);
  const user = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
  });

  if (!user) {
    console.log(`User ${email} not found!`);
    process.exit(1);
  }

  const hashedPassword = await hashPassword(newPassword);
  console.log(`New password hash: ${hashedPassword.substring(0, 20)}...`);

  const account = await db.query.account.findFirst({
    where: eq(schema.account.userId, user.id),
  });

  if (account) {
    await db
      .update(schema.account)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(schema.account.id, account.id));
    console.log(`Updated existing account ID ${account.id} with new password.`);
  } else {
    const newAccId = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
    await db.insert(schema.account).values({
      id: newAccId,
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Inserted new account record for user ${user.id}.`);
  }

  console.log("Password updated successfully!");
  process.exit(0);
}

setCustomerPassword().catch(err => {
  console.error(err);
  process.exit(1);
});
