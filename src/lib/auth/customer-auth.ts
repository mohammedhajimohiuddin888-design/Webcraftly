import { db, schema } from "../db/index.ts";
import { eq } from "drizzle-orm";
import { hashPassword } from "@better-auth/utils/password";
import { auth } from "./index.ts";

const DESIGNATED_ADMINS = [
  "mohammedhajimohiuddin888@gmail.com",
  "mdausafmohiuddin@gmail.com",
  "rizwanalisyed552@gmail.com",
];

/**
 * Customer authentication handler:
 * Ensures customers always log in with their OWN chosen password,
 * never tied to or blocked by admin credentials.
 */
export async function handleCustomerAuth(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const cleanEmail = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();
    const name = (
      body.name ||
      (cleanEmail.split("@")[0] || "Client").replace(/[._-]/g, " ")
    ).trim();

    if (!cleanEmail || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters long." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1. If an admin email tries to authenticate:
    // They must use their official admin credentials; never overwrite admin passwords.
    if (DESIGNATED_ADMINS.includes(cleanEmail)) {
      const adminReq = new Request(new URL("/api/auth/sign-in/email", request.url), {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      return auth.handler(adminReq);
    }

    // 2. Check if the user already exists in the database
    const existingUser = await db.query.user.findFirst({
      where: eq(schema.user.email, cleanEmail),
    });

    if (!existingUser) {
      // New Customer: Register them seamlessly with their chosen email and password
      const signUpReq = new Request(new URL("/api/auth/sign-up/email", request.url), {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({
          name,
          email: cleanEmail,
          password,
        }),
      });
      return auth.handler(signUpReq);
    }

    // 3. Existing User: Check role
    if (existingUser.role === "admin") {
      // Do not allow admin password tampering
      const adminReq = new Request(new URL("/api/auth/sign-in/email", request.url), {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      return auth.handler(adminReq);
    }

    // 4. Existing Customer:
    // Update the customer's password hash in the database to whatever password they entered!
    const hashedPassword = await hashPassword(password);
    const existingAccount = await db.query.account.findFirst({
      where: eq(schema.account.userId, existingUser.id),
    });

    if (existingAccount) {
      await db
        .update(schema.account)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(schema.account.id, existingAccount.id));
    } else {
      const newAccId = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
      await db.insert(schema.account).values({
        id: newAccId,
        accountId: existingUser.id,
        providerId: "credential",
        userId: existingUser.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Update name if a custom name was provided
    if (body.name && body.name.trim() && body.name.trim() !== existingUser.name) {
      await db
        .update(schema.user)
        .set({ name: body.name.trim(), updatedAt: new Date() })
        .where(eq(schema.user.id, existingUser.id));
    }

    // 5. Sign in customer with Better Auth and return session cookie
    const signInReq = new Request(new URL("/api/auth/sign-in/email", request.url), {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    return auth.handler(signInReq);
  } catch (err: unknown) {
    const error = err as Error;
    return new Response(
      JSON.stringify({ error: error.message || "Customer authentication failed." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
