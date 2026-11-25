import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "../db/index.ts";

// Ensure .env.local is loaded in local server-side environment
if (!process.env["DATABASE_URL"]) {
  try {
    process.loadEnvFile?.(".env.local");
  } catch {}
}

const authSecret =
  process.env["BETTER_AUTH_SECRET"] || "webcraftly-dev-auth-secret-32-chars-long";
const authBaseUrl =
  process.env["BETTER_AUTH_URL"] ||
  (process.env["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : "http://localhost:8080");

const baseDrizzleAdapter = drizzleAdapter(db, {
  provider: "pg",
  schema: {
    user: schema.user,
    session: schema.session,
    account: schema.account,
    verification: schema.verification,
  },
});

/**
 * Privacy-preserving adapter wrapper:
 * Completely prevents any IP address collection or storage in Neon PostgreSQL.
 * Strips ipAddress from session write operations and reports ipAddress as null.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const zeroIpDrizzleAdapter = (options: any) => {
  const instance = baseDrizzleAdapter(options);
  const origCreate = instance.create.bind(instance);
  const origUpdate = instance.update.bind(instance);
  const origUpdateMany = instance.updateMany?.bind(instance);

  instance.create = async (args: any) => {
    if (args.model === "session" && args.data && "ipAddress" in args.data) {
      const { ipAddress: _, ...cleanData } = args.data;
      return (origCreate as any)({ ...args, data: cleanData });
    }
    if (args.model === "user" && args.data) {
      const designatedAdmins = [
        "mohammedhajimohiuddin888@gmail.com",
        "mdausafmohiuddin@gmail.com",
        "rizwanalisyed552@gmail.com",
      ];
      if (designatedAdmins.includes(args.data.email?.toLowerCase())) {
        args.data.role = "admin";
      }
    }
    return (origCreate as any)(args);
  };

  instance.update = async (args: any) => {
    if (args.model === "session" && args.update && "ipAddress" in args.update) {
      const { ipAddress: _, ...cleanUpdate } = args.update;
      return (origUpdate as any)({ ...args, update: cleanUpdate });
    }
    return (origUpdate as any)(args);
  };

  if (origUpdateMany) {
    instance.updateMany = async (args: any) => {
      if (args.model === "session" && args.update && "ipAddress" in args.update) {
        const { ipAddress: _, ...cleanUpdate } = args.update;
        return (origUpdateMany as any)({ ...args, update: cleanUpdate });
      }
      return (origUpdateMany as any)(args);
    };
  }

  return instance;
};

export const auth = betterAuth({
  database: zeroIpDrizzleAdapter,
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false, // CRITICAL: blocks client payloads from setting role on registration
      },
      phone: { type: "string", defaultValue: "" },
      businessName: { type: "string", defaultValue: "" },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    database: {
      validateSchema: false, // Schema validated independently against Neon
    },
    ipAddress: {
      disableIpTracking: true, // Strictly disables client IP tracking
    },
    useSecureCookies: process.env["NODE_ENV"] === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://*.vercel.app",
    ...(process.env["BETTER_AUTH_TRUSTED_ORIGINS"]
      ? process.env["BETTER_AUTH_TRUSTED_ORIGINS"].split(",").map((s) => s.trim())
      : []),
  ],
  secret: authSecret,
  baseURL: authBaseUrl,
});

// ============================================================================
// SERVER-SIDE AUTHORIZATION GUARDS
// ============================================================================

/**
 * Extracts and verifies the session from an incoming Web standard Request.
 */
export async function getServerSession(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session;
  } catch {
    return null;
  }
}

/**
 * Requires an authenticated user session. Throws 401 if unauthenticated.
 */
export async function requireAuth(request: Request) {
  const session = await getServerSession(request);
  if (!session || !session.user) {
    const error = new Error("Authentication required. Please log in.");
    (error as unknown as { status: number }).status = 401;
    throw error;
  }
  return session;
}

/**
 * Enforces customer data isolation. Asserts that the authenticated user
 * is either the resource owner (userId === targetUserId) or an admin.
 * Throws 403 Forbidden on violation.
 */
export async function requireCustomer(request: Request, targetUserId: string) {
  const session = await requireAuth(request);
  const isOwner = session.user.id === targetUserId;
  const isAdmin = (session.user as unknown as { role?: string }).role === "admin";

  if (!isOwner && !isAdmin) {
    const error = new Error("Access denied: You cannot view or modify another customer's data.");
    (error as unknown as { status: number }).status = 403;
    throw error;
  }

  return session;
}

/**
 * Requires an authenticated administrator session (user.role === 'admin').
 * Throws 403 Forbidden for customer sessions.
 */
export async function requireAdmin(request: Request) {
  const session = await requireAuth(request);
  const role = (session.user as unknown as { role?: string }).role;

  if (role !== "admin") {
    const error = new Error("Forbidden: This action requires administrator privileges.");
    (error as unknown as { status: number }).status = 403;
    throw error;
  }

  return session;
}
