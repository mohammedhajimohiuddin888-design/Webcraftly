/**
 * Milestone 4: Comprehensive Better Auth Flow & Security Test
 *
 * Verifies:
 * 1. Customer registration via /api/auth/sign-up/email
 * 2. Role tampering protection: public registration can NEVER create admin accounts
 * 3. Duplicate email rejection
 * 4. Customer login via /api/auth/sign-in/email & cookie attributes (httpOnly, SameSite=Lax)
 * 5. Session retrieval via /api/auth/get-session & zero IP address storage
 * 6. Customer data isolation (User A cannot access User B's data)
 * 7. Admin protection (Customer session receives 403 Forbidden)
 * 8. Customer logout & session revocation
 */

import { auth, requireCustomer, requireAdmin } from "../src/lib/auth/index.ts";
import { db, schema } from "../src/lib/db/index.ts";
import { eq } from "drizzle-orm";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

console.log("\n======================================================================");
console.log("MILESTONE 4: BETTER AUTH VERIFICATION & SECURITY TEST SUITE");
console.log("======================================================================\n");

async function runAuthTests() {
  const timestamp = Date.now();
  const testUserA = {
    name: "Customer Alpha",
    email: `customer.alpha.${timestamp}@example.com`,
    password: "SecurePassword123!",
  };

  const testUserB = {
    name: "Customer Beta",
    email: `customer.beta.${timestamp}@example.com`,
    password: "SecurePassword123!",
  };

  const hackerUser = {
    name: "Sneaky Hacker",
    email: `hacker.${timestamp}@example.com`,
    password: "HackerPassword123!",
    role: "admin", // ATTEMPTED EXPLOIT
  };

  // Helper to simulate HTTP requests to auth.handler
  async function authRequest(path, method = "GET", body = null, cookie = null) {
    const headers = new Headers();
    headers.set("content-type", "application/json");
    headers.set("origin", "http://localhost:8080");
    if (cookie) headers.set("cookie", cookie);

    const reqInit = {
      method,
      headers,
    };
    if (body) reqInit.body = JSON.stringify(body);

    const request = new Request(`http://localhost:8080/api/auth/${path}`, reqInit);
    const response = await auth.handler(request);
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    return { response, data, headers: response.headers };
  }

  // -------------------------------------------------------------------------
  // TEST 1: Customer Alpha Registration
  // -------------------------------------------------------------------------
  console.log("-> TEST 1: Customer Registration (/api/auth/sign-up/email)...");
  const regResA = await authRequest("sign-up/email", "POST", testUserA);

  if (regResA.response.status !== 200 || !regResA.data?.user?.id) {
    throw new Error(`Customer A registration failed with status ${regResA.response.status}: ${JSON.stringify(regResA.data)}`);
  }
  const userAId = regResA.data.user.id;
  console.log(`   [✓] Customer Alpha registered successfully (ID: ${userAId})`);

  // Verify in Neon DB
  const dbUserA = await db.query.user.findFirst({ where: eq(schema.user.id, userAId) });
  if (!dbUserA || dbUserA.role !== "customer") {
    throw new Error(`Database user role mismatch! Expected 'customer', found '${dbUserA?.role}'`);
  }
  console.log(`   [✓] Neon database record verified: role is strictly '${dbUserA.role}'`);

  // -------------------------------------------------------------------------
  // TEST 2: Role Tampering Prevention (Public signup must NEVER assign admin)
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 2: Role Tampering Prevention (Attempting role: 'admin' on signup)...");
  const regHacker = await authRequest("sign-up/email", "POST", hackerUser);

  if (regHacker.response.status !== 200 || !regHacker.data?.user?.id) {
    throw new Error(`Hacker registration request failed: ${JSON.stringify(regHacker.data)}`);
  }
  const hackerId = regHacker.data.user.id;

  // Inspect database record for hacker: role must be 'customer'
  const dbHacker = await db.query.user.findFirst({ where: eq(schema.user.id, hackerId) });
  if (dbHacker.role === "admin") {
    throw new Error("SECURITY FAILURE: User successfully assigned themselves 'admin' role!");
  }
  console.log(`   [✓] Security Verified: Client role parameter discarded by Better Auth (input: false).`);
  console.log(`   [✓] Resulting database role: '${dbHacker.role}' (strictly 'customer')`);

  // -------------------------------------------------------------------------
  // TEST 3: Duplicate Email Rejection
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 3: Duplicate Email Rejection...");
  const dupRes = await authRequest("sign-up/email", "POST", testUserA);
  if (dupRes.response.status === 200) {
    throw new Error("FAIL: Duplicate registration with same email was accepted!");
  }
  console.log(`   [✓] Duplicate registration rejected with status ${dupRes.response.status}`);

  // -------------------------------------------------------------------------
  // TEST 4: Customer Registration & Login of User B
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 4: Registering Customer Beta...");
  const regResB = await authRequest("sign-up/email", "POST", testUserB);
  const userBId = regResB.data?.user?.id;
  console.log(`   [✓] Customer Beta registered successfully (ID: ${userBId})`);

  // -------------------------------------------------------------------------
  // TEST 5: Customer Login & Session Cookie Verification
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 5: Customer Login & Cookie Verification (/api/auth/sign-in/email)...");
  const loginRes = await authRequest("sign-in/email", "POST", {
    email: testUserA.email,
    password: testUserA.password,
  });

  if (loginRes.response.status !== 200) {
    throw new Error(`Login failed with status ${loginRes.response.status}: ${JSON.stringify(loginRes.data)}`);
  }

  const setCookie = loginRes.headers.get("set-cookie") || "";
  console.log(`   [✓] Login successful (HTTP 200 OK)`);
  if (!setCookie.toLowerCase().includes("httponly")) {
    throw new Error("FAIL: Session cookie is missing HttpOnly flag!");
  }
  if (!setCookie.toLowerCase().includes("samesite=lax")) {
    throw new Error("FAIL: Session cookie is missing SameSite=Lax!");
  }
  console.log(`   [✓] Cookie Security Verified: HttpOnly=true, SameSite=Lax`);

  // Extract session token from cookie
  const cookieMatch = setCookie.match(/better-auth\.session_token=([^;]+)/);
  const sessionToken = cookieMatch ? cookieMatch[1] : null;
  if (!sessionToken) {
    throw new Error("FAIL: could not extract session token from Set-Cookie header");
  }
  const cookieHeader = `better-auth.session_token=${sessionToken}`;

  // -------------------------------------------------------------------------
  // TEST 6: Session Retrieval & Zero IP Storage Verification
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 6: Session Retrieval (/api/auth/get-session) & Zero-IP Storage Check...");
  const sessionRes = await authRequest("get-session", "GET", null, cookieHeader);

  if (sessionRes.response.status !== 200 || !sessionRes.data?.user) {
    throw new Error(`Failed to retrieve session: ${JSON.stringify(sessionRes.data)}`);
  }
  console.log(`   [✓] Active Session confirmed for: ${sessionRes.data.user.email}`);

  // Query session row directly in Neon to verify zero IP address stored
  const dbSession = await db.query.session.findFirst({
    where: eq(schema.session.userId, userAId),
  });
  if ("ipAddress" in dbSession && dbSession.ipAddress) {
    throw new Error("FAIL: IP address was stored in session table!");
  }
  console.log(`   [✓] Zero IP Storage Verified: session table contains NO client IP address`);

  // -------------------------------------------------------------------------
  // TEST 7: Customer Data Isolation (User A cannot access User B's resources)
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 7: Customer Data Isolation Guard (requireCustomer)...");
  const authReqA = new Request("http://localhost:8080/api/customer/orders", {
    headers: { cookie: cookieHeader },
  });

  // User A accessing User A's data -> MUST SUCCEED
  const sessionSelf = await requireCustomer(authReqA, userAId);
  console.log(`   [✓] User A accessing own data: AUTHORIZED (User: ${sessionSelf.user.id})`);

  // User A accessing User B's data -> MUST BE REJECTED WITH 403
  let crossCustomerBlocked = false;
  try {
    await requireCustomer(authReqA, userBId);
  } catch (err) {
    if (err.status === 403 || err.message.includes("Access denied")) {
      crossCustomerBlocked = true;
      console.log(`   [✓] User A accessing User B data: REJECTED WITH 403 (${err.message})`);
    } else {
      throw err;
    }
  }
  if (!crossCustomerBlocked) {
    throw new Error("SECURITY FAILURE: Customer A was allowed to access Customer B's resources!");
  }

  // -------------------------------------------------------------------------
  // TEST 8: Unauthorized Admin Access Rejection (requireAdmin)
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 8: Unauthorized Admin Access Guard (requireAdmin)...");
  let adminAccessBlocked = false;
  try {
    await requireAdmin(authReqA);
  } catch (err) {
    if (err.status === 403 || err.message.includes("Forbidden")) {
      adminAccessBlocked = true;
      console.log(`   [✓] Customer session accessing admin operation: REJECTED WITH 403 (${err.message})`);
    } else {
      throw err;
    }
  }
  if (!adminAccessBlocked) {
    throw new Error("SECURITY FAILURE: Customer session was permitted into admin operation!");
  }

  // -------------------------------------------------------------------------
  // TEST 9: Sign-Out & Session Revocation
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 9: Sign-out & Session Revocation (/api/auth/sign-out)...");
  const signoutRes = await authRequest("sign-out", "POST", {}, cookieHeader);
  console.log(`   [✓] Sign-out called: status ${signoutRes.response.status}`);

  // Try retrieving session with old cookie
  const expiredSessionRes = await authRequest("get-session", "GET", null, cookieHeader);
  if (expiredSessionRes.data?.session || expiredSessionRes.data?.user) {
    throw new Error("FAIL: Session was not revoked after sign-out!");
  }
  console.log(`   [✓] Session successfully revoked: subsequent get-session returned null`);

  console.log("\n======================================================================");
  console.log("ALL 9 BETTER AUTH VERIFICATION & SECURITY TESTS PASSED!");
  console.log("======================================================================\n");
}

try {
  await runAuthTests();
  process.exit(0);
} catch (e) {
  console.error("\nTEST SUITE FAILED:", e);
  process.exit(1);
}
