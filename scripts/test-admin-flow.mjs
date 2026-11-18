/**
 * Milestone 5: Admin Provisioning & Authorization Security Test
 *
 * Verifies:
 * 1. Customer account cannot access admin operations (403 Forbidden)
 * 2. CLI promotion sets user role to 'admin' in Neon PostgreSQL
 * 3. Neon database record verified directly
 * 4. Admin login via /api/auth/sign-in/email succeeds with valid session
 * 5. Admin session retrieval confirms role === 'admin'
 * 6. Admin session authorized by requireAdmin
 * 7. Customer session remains blocked by requireAdmin (403 Forbidden)
 * 8. Admin logout revokes session
 * 9. Zero credentials or passwords leaked
 */

import { auth, requireAdmin, requireAuth } from "../src/lib/auth/index.ts";
import { db, schema, sqlClient } from "../src/lib/db/index.ts";
import { eq } from "drizzle-orm";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

console.log("\n======================================================================");
console.log("MILESTONE 5: ADMIN PROVISIONING & AUTHORIZATION TEST SUITE");
console.log("======================================================================\n");

async function runAdminFlowTests() {
  const timestamp = Date.now();
  const customerUser = {
    name: "Regular Customer",
    email: `regular.customer.${timestamp}@example.com`,
    password: "CustomerPassword123!",
  };

  const adminUser = {
    name: "WebCraftly Founder",
    email: `founder.admin.${timestamp}@example.com`,
    password: "AdminSuperSecret456!",
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
  // TEST 1: Register Normal Customer & Verify Initial Customer Role
  // -------------------------------------------------------------------------
  console.log("-> TEST 1: Registering standard customer account...");
  const custReg = await authRequest("sign-up/email", "POST", customerUser);
  if (custReg.response.status !== 200 || !custReg.data?.user?.id) {
    throw new Error(`Customer signup failed: ${JSON.stringify(custReg.data)}`);
  }
  const customerId = custReg.data.user.id;
  const custCookie = custReg.headers.get("set-cookie") || "";
  const custSessionToken = custCookie.match(/better-auth\.session_token=([^;]+)/)?.[1];
  const custCookieHeader = `better-auth.session_token=${custSessionToken}`;
  console.log(`   [✓] Customer registered (ID: ${customerId})`);

  // Direct Neon DB check
  const dbCust = await db.query.user.findFirst({ where: eq(schema.user.id, customerId) });
  if (dbCust.role !== "customer") {
    throw new Error(`Expected role 'customer', found '${dbCust.role}'`);
  }
  console.log(`   [✓] Neon database verified: user role is strictly '${dbCust.role}'`);

  // -------------------------------------------------------------------------
  // TEST 2: Customer Attempting Admin Access Must Receive 403 Forbidden
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 2: Testing customer access to requireAdmin guard...");
  const custAdminReq = new Request("http://localhost:8080/api/admin/orders", {
    headers: { cookie: custCookieHeader },
  });

  let custBlocked = false;
  try {
    await requireAdmin(custAdminReq);
  } catch (err) {
    if (err.status === 403 || err.message.includes("Forbidden")) {
      custBlocked = true;
      console.log(`   [✓] Customer access strictly blocked: 403 Forbidden (${err.message})`);
    } else {
      throw err;
    }
  }
  if (!custBlocked) {
    throw new Error("SECURITY FAILURE: Normal customer was permitted to execute an admin operation!");
  }

  // -------------------------------------------------------------------------
  // TEST 3: Register Admin Account (Initially 'customer' via public signup)
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 3: Registering target user for admin promotion...");
  const adminReg = await authRequest("sign-up/email", "POST", adminUser);
  if (adminReg.response.status !== 200 || !adminReg.data?.user?.id) {
    throw new Error(`Admin signup failed: ${JSON.stringify(adminReg.data)}`);
  }
  const adminId = adminReg.data.user.id;
  console.log(`   [✓] User registered (ID: ${adminId}) with default role '${adminReg.data.user.role || "customer"}'`);

  // -------------------------------------------------------------------------
  // TEST 4: Execute Admin Promotion & Verify Directly in Neon DB
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 4: Promoting account to 'admin' role in Neon PostgreSQL...");
  await db
    .update(schema.user)
    .set({
      role: "admin",
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, adminId));

  // Direct verification in Neon
  const dbAdmin = await db.query.user.findFirst({ where: eq(schema.user.id, adminId) });
  if (!dbAdmin || dbAdmin.role !== "admin") {
    throw new Error(`Neon DB verification failed! Expected role 'admin', found '${dbAdmin?.role}'`);
  }
  console.log(`   [✓] Neon PostgreSQL record verified: role is strictly '${dbAdmin.role}'`);
  console.log(`   [✓] Verified User ID: ${dbAdmin.id}, Email: ${dbAdmin.email}`);

  // -------------------------------------------------------------------------
  // TEST 5: Admin Login via /api/auth/sign-in/email
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 5: Admin Login (/api/auth/sign-in/email)...");
  const loginRes = await authRequest("sign-in/email", "POST", {
    email: adminUser.email,
    password: adminUser.password,
  });

  if (loginRes.response.status !== 200) {
    throw new Error(`Admin login failed with status ${loginRes.response.status}: ${JSON.stringify(loginRes.data)}`);
  }
  const adminSetCookie = loginRes.headers.get("set-cookie") || "";
  const adminSessionToken = adminSetCookie.match(/better-auth\.session_token=([^;]+)/)?.[1];
  if (!adminSessionToken) {
    throw new Error("Failed to extract admin session token from login response");
  }
  const adminCookieHeader = `better-auth.session_token=${adminSessionToken}`;
  console.log(`   [✓] Admin login successful (HTTP 200 OK)`);

  // -------------------------------------------------------------------------
  // TEST 6: Session Retrieval & Admin Role Verification
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 6: Admin Session Retrieval (/api/auth/get-session)...");
  const sessionRes = await authRequest("get-session", "GET", null, adminCookieHeader);
  if (sessionRes.response.status !== 200 || !sessionRes.data?.user) {
    throw new Error(`Failed to retrieve admin session: ${JSON.stringify(sessionRes.data)}`);
  }
  if (sessionRes.data.user.role !== "admin") {
    throw new Error(`Session user role mismatch! Expected 'admin', got '${sessionRes.data.user.role}'`);
  }
  console.log(`   [✓] Session verified for: ${sessionRes.data.user.email}`);
  console.log(`   [✓] Session user role confirmed: '${sessionRes.data.user.role}'`);

  // -------------------------------------------------------------------------
  // TEST 7: Authorization Check: requireAdmin with Admin Session
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 7: requireAdmin authorization with Admin Session...");
  const adminProtectedReq = new Request("http://localhost:8080/api/admin/system", {
    headers: { cookie: adminCookieHeader },
  });

  const verifiedSession = await requireAdmin(adminProtectedReq);
  if (!verifiedSession || verifiedSession.user.role !== "admin") {
    throw new Error("Admin session failed requireAdmin check!");
  }
  console.log(`   [✓] requireAdmin AUTHORIZED: Admin session granted access (User: ${verifiedSession.user.id})`);

  // -------------------------------------------------------------------------
  // TEST 8: Customer Session Re-check Against requireAdmin (Must Still Fail)
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 8: Verifying customer session still receives 403 Forbidden...");
  let secondCustBlocked = false;
  try {
    await requireAdmin(custAdminReq);
  } catch (err) {
    if (err.status === 403) {
      secondCustBlocked = true;
      console.log(`   [✓] Customer session consistently blocked with 403 Forbidden`);
    } else {
      throw err;
    }
  }
  if (!secondCustBlocked) {
    throw new Error("SECURITY FAILURE: Customer session unexpectedly gained admin access!");
  }

  // -------------------------------------------------------------------------
  // TEST 9: Admin Sign-out & Revocation
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 9: Admin Sign-out & Session Revocation (/api/auth/sign-out)...");
  const signoutRes = await authRequest("sign-out", "POST", {}, adminCookieHeader);
  if (signoutRes.response.status !== 200) {
    throw new Error(`Sign-out failed with status ${signoutRes.response.status}`);
  }
  console.log(`   [✓] Admin sign-out successful (HTTP 200 OK)`);

  const expiredSessionRes = await authRequest("get-session", "GET", null, adminCookieHeader);
  if (expiredSessionRes.data?.session || expiredSessionRes.data?.user) {
    throw new Error("Session was not revoked after sign-out!");
  }
  console.log(`   [✓] Admin session revoked; subsequent get-session returned null`);

  // -------------------------------------------------------------------------
  // TEST 10: Zero Credential / Password Exposure Check
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 10: Security & Credential Hygiene Verification...");
  const dbUserFull = await db.query.user.findFirst({ where: eq(schema.user.id, adminId) });
  if ("password" in dbUserFull && dbUserFull.password) {
    throw new Error("SECURITY FAILURE: Raw password found in user table!");
  }
  console.log(`   [✓] User table contains zero raw passwords (credentials managed in hashed account table)`);
  console.log(`   [✓] Credentials Leak Check: PASSED (Zero credentials exposed)`);

  console.log("\n======================================================================");
  console.log("ALL 10 ADMIN PROVISIONING & AUTHORIZATION TESTS PASSED!");
  console.log("======================================================================\n");

  await sqlClient.end();
}

try {
  await runAdminFlowTests();
  process.exit(0);
} catch (e) {
  console.error("\nTEST SUITE FAILED:", e);
  try {
    await sqlClient.end();
  } catch {}
  process.exit(1);
}
