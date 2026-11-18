/**
 * Milestone 6: Order Lifecycle & WhatsApp Commerce Comprehensive Test
 *
 * Verifies:
 * 1. Server-side catalog price re-validation against Neon database
 * 2. Canonical customer resolution (registered and guest)
 * 3. Order persistence in Neon with initial 'Pending Confirmation' & 'Awaiting Payment'
 * 4. WhatsApp brief & deep-link generation using exact business number (+919618805557)
 * 5. Customer data isolation (User B cannot see User A's orders)
 * 6. Admin full visibility over marketplace orders
 * 7. Append-only manual payment recording & balance calculation
 * 8. Separation of payment verification and explicit project approval
 * 9. Customer order tracking reflects verified updates
 */

import { auth } from "../src/lib/auth/index.ts";
import { db, schema, sqlClient } from "../src/lib/db/index.ts";
import { eq, sql } from "drizzle-orm";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

console.log("\n======================================================================");
console.log("MILESTONE 6: ORDER LIFECYCLE & WHATSAPP COMMERCE TEST SUITE");
console.log("======================================================================\n");

async function runOrderLifecycleTests() {
  const timestamp = Date.now();

  const userAlpha = {
    name: "Alpha Merchant",
    email: `alpha.merchant.${timestamp}@example.com`,
    password: "Password123!Secure",
    phone: "+919876543210",
    businessName: "Alpha Retailers",
  };

  const userBeta = {
    name: "Beta Studio",
    email: `beta.studio.${timestamp}@example.com`,
    password: "Password123!Secure",
    phone: "+919876543211",
    businessName: "Beta Design House",
  };

  const adminUser = {
    name: "WebCraftly Founder",
    email: `admin.orders.${timestamp}@example.com`,
    password: "AdminPassword123!",
  };

  // Helper for HTTP requests
  async function apiRequest(path, method = "GET", body = null, cookie = null) {
    const headers = new Headers();
    headers.set("content-type", "application/json");
    headers.set("origin", "http://localhost:8080");
    if (cookie) headers.set("cookie", cookie);

    const reqInit = {
      method,
      headers,
    };
    if (body) reqInit.body = JSON.stringify(body);

    const res = await fetch(`http://localhost:8080${path}`, reqInit);
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { response: res, data, headers: res.headers };
  }

  // Helper to register & login a user, returning session cookie
  async function createSession(userData, makeAdmin = false) {
    // 1. Register via Better Auth
    const regRes = await apiRequest("/api/auth/sign-up/email", "POST", {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });
    if (regRes.response.status !== 200 || !regRes.data?.user?.id) {
      throw new Error(`Signup failed for ${userData.email}: ${JSON.stringify(regRes.data)}`);
    }
    const userId = regRes.data.user.id;

    if (makeAdmin) {
      await db
        .update(schema.user)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(schema.user.id, userId));
    }

    // 2. Login to get fresh session cookie
    const loginRes = await apiRequest("/api/auth/sign-in/email", "POST", {
      email: userData.email,
      password: userData.password,
    });
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const sessionToken = setCookie.match(/better-auth\.session_token=([^;]+)/)?.[1];
    if (!sessionToken) throw new Error("Could not extract session token");

    return {
      userId,
      email: userData.email,
      cookie: `better-auth.session_token=${sessionToken}`,
    };
  }

  // -------------------------------------------------------------------------
  // SETUP: Provision User Alpha, User Beta, and Admin
  // -------------------------------------------------------------------------
  console.log("-> Setting up test accounts...");
  const alphaSession = await createSession(userAlpha);
  const betaSession = await createSession(userBeta);
  const adminSession = await createSession(adminUser, true);
  console.log("   [✓] Alpha Customer ID: " + alphaSession.userId);
  console.log("   [✓] Beta Customer ID:  " + betaSession.userId);
  console.log("   [✓] Admin ID:          " + adminSession.userId);

  // -------------------------------------------------------------------------
  // TEST 1: Server-Side Catalog Price Re-Validation & Price Tamper Resistance
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 1: Order Creation with Price Tamper Resistance...");
  // Attempt to pass manipulated lower prices (100 INR instead of 9,999 INR)
  const tamperedOrderPayload = {
    customerName: userAlpha.name,
    customerEmail: userAlpha.email,
    customerPhone: userAlpha.phone,
    customerBusinessName: userAlpha.businessName,
    projectDescription: "Custom responsive e-commerce web platform with WhatsApp support.",
    deliveryTimeline: "Express 72-Hour Delivery",
    referenceUrl: "https://example.com/ref",
    requiredFeatures: "Mobile-responsive, SEO optimized, Fast loading",
    items: [
      {
        serviceSlug: "website-development",
        serviceName: "Website Development",
        packageName: "Basic",
        packagePrice: 100, // ATTEMPTED TAMPER: DB price is 9999
        addOns: [
          {
            id: "wd-extra-page",
            name: "Additional Custom Page",
            price: 50, // ATTEMPTED TAMPER: DB price is 1999
          },
        ],
      },
    ],
  };

  const createRes = await apiRequest("/api/orders", "POST", tamperedOrderPayload, alphaSession.cookie);
  if (createRes.response.status !== 201 || !createRes.data?.order?.id) {
    throw new Error(`Order creation failed with status ${createRes.response.status}: ${JSON.stringify(createRes.data)}`);
  }

  const orderA = createRes.data.order;
  console.log(`   [✓] Order created successfully: Reference ID '${orderA.id}'`);

  // Verify that the server ignored client tampered prices and re-validated against Neon DB
  // Expected: website-development (Basic) = 9999, wd-extra-page = 1999. Total = 11998
  if (orderA.subtotal !== 11998 || orderA.total !== 11998) {
    throw new Error(
      `SECURITY FAILURE: Server-side pricing failed! Expected 11998, received subtotal: ${orderA.subtotal}, total: ${orderA.total}`
    );
  }
  console.log(`   [✓] Price Tamper Resistance Verified: Server re-validated against Neon DB (Total: ₹${orderA.total})`);

  // -------------------------------------------------------------------------
  // TEST 2: Canonical Customer Resolution in Neon DB
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 2: Canonical Customer Linking in Neon...");
  const dbCustomer = await db.query.customers.findFirst({
    where: eq(schema.customers.id, orderA.customerId),
  });
  if (!dbCustomer || dbCustomer.userId !== alphaSession.userId) {
    throw new Error("Canonical customer record mismatch: order not linked to authenticated user");
  }
  console.log(`   [✓] Canonical Customer verified: ID '${dbCustomer.id}' linked to User '${dbCustomer.userId}'`);

  // -------------------------------------------------------------------------
  // TEST 3: Initial Order Statuses in Neon DB
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 3: Initial Order State Verification in Neon...");
  if (orderA.status !== "Pending Confirmation") {
    throw new Error(`Order status mismatch! Expected 'Pending Confirmation', got '${orderA.status}'`);
  }
  if (orderA.paymentStatus !== "Awaiting Payment") {
    throw new Error(`Payment status mismatch! Expected 'Awaiting Payment', got '${orderA.paymentStatus}'`);
  }
  if (orderA.paymentMethod !== "whatsapp_manual") {
    throw new Error(`Payment method mismatch! Expected 'whatsapp_manual', got '${orderA.paymentMethod}'`);
  }
  console.log(`   [✓] Initial Order Status: '${orderA.status}'`);
  console.log(`   [✓] Initial Payment Status: '${orderA.paymentStatus}'`);
  console.log(`   [✓] Payment Method: '${orderA.paymentMethod}' (Zero Razorpay)`);

  // -------------------------------------------------------------------------
  // TEST 4: WhatsApp Brief & URL Validation (+91 96188 05557)
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 4: WhatsApp Integration Validation (+91 96188 05557)...");
  const { whatsappUrl, whatsappBrief, businessNumber } = createRes.data;

  if (businessNumber !== "+919618805557") {
    throw new Error(`WhatsApp business number mismatch! Expected +919618805557, got '${businessNumber}'`);
  }
  if (!whatsappUrl.startsWith("https://wa.me/919618805557?text=")) {
    throw new Error(`WhatsApp deep-link mismatch! Got '${whatsappUrl}'`);
  }
  if (!whatsappBrief.includes(orderA.id)) {
    throw new Error("WhatsApp brief does not contain Order Reference ID!");
  }
  if (!whatsappBrief.includes("11,998")) {
    throw new Error("WhatsApp brief does not contain verified total amount!");
  }
  console.log(`   [✓] WhatsApp target number verified: +919618805557`);
  console.log(`   [✓] WhatsApp pre-filled URL verified: ${whatsappUrl.slice(0, 65)}...`);
  console.log(`   [✓] WhatsApp message contains Order ID '${orderA.id}' and Verified Total '₹11,998'`);

  // -------------------------------------------------------------------------
  // TEST 5: Customer Data Isolation (User Beta cannot see User Alpha's orders)
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 5: Customer Data Isolation Verification...");

  // Alpha querying own orders
  const alphaOrdersRes = await apiRequest("/api/orders", "GET", null, alphaSession.cookie);
  const alphaOrders = alphaOrdersRes.data?.orders || [];
  if (alphaOrders.length === 0 || alphaOrders[0].id !== orderA.id) {
    throw new Error("User Alpha could not retrieve own orders!");
  }
  console.log(`   [✓] User Alpha viewing own orders: Found ${alphaOrders.length} order(s)`);

  // Beta querying own orders (must have 0 orders)
  const betaOrdersRes = await apiRequest("/api/orders", "GET", null, betaSession.cookie);
  const betaOrders = betaOrdersRes.data?.orders || [];
  if (betaOrders.length !== 0) {
    throw new Error(`SECURITY FAILURE: User Beta saw ${betaOrders.length} orders belonging to User Alpha!`);
  }
  console.log(`   [✓] User Beta viewing own orders: Correctly isolated (0 orders returned)`);

  // Beta attempting to view Alpha's specific order by ID -> MUST RECEIVE 403 FORBIDDEN
  const crossOrderRes = await apiRequest(`/api/orders/${orderA.id}`, "GET", null, betaSession.cookie);
  if (crossOrderRes.response.status !== 403) {
    throw new Error(`SECURITY FAILURE: User Beta accessed User Alpha's order with status ${crossOrderRes.response.status}`);
  }
  console.log(`   [✓] User Beta accessing User Alpha's order ID: Strictly REJECTED (HTTP 403 Forbidden)`);

  // -------------------------------------------------------------------------
  // TEST 6: Admin Marketplace Overview
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 6: Admin Order Management Visibility...");
  const adminOrdersRes = await apiRequest("/api/admin/orders", "GET", null, adminSession.cookie);
  if (adminOrdersRes.response.status !== 200) {
    throw new Error(`Admin failed to get orders: ${JSON.stringify(adminOrdersRes.data)}`);
  }
  const adminOrders = adminOrdersRes.data?.orders || [];
  const foundOrder = adminOrders.find((o) => o.id === orderA.id);
  if (!foundOrder) {
    throw new Error("Admin orders list did not include newly created order!");
  }
  console.log(`   [✓] Admin successfully retrieved all marketplace orders (Found Order: ${foundOrder.id})`);

  // -------------------------------------------------------------------------
  // TEST 7: Append-Only Manual Payment Recording & Balance Calculation
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 7: Manual Partial Payment Recording in Append-Only Ledger...");
  // Record partial payment of ₹5,000
  const partialPaymentPayload = {
    amount: 5000,
    paymentMethod: "UPI Transfer / WhatsApp Discussed",
    paymentReference: "UTR987654321012",
    notes: "Advance token received via GPay. Verified in bank account.",
  };

  const pay1Res = await apiRequest(
    `/api/admin/orders/${orderA.id}/payments`,
    "POST",
    partialPaymentPayload,
    adminSession.cookie
  );

  if (pay1Res.response.status !== 201 || !pay1Res.data?.payment?.id) {
    throw new Error(`Payment recording failed: ${JSON.stringify(pay1Res.data)}`);
  }

  const { payment: payment1, order: orderAfterPay1, totalPaid: paid1, remainingBalance: bal1 } = pay1Res.data;
  console.log(`   [✓] Payment Record created: ID '${payment1.id}' (Amount: ₹${payment1.amount})`);
  console.log(`   [✓] Verified Total Paid: ₹${paid1}`);
  console.log(`   [✓] Remaining Balance:   ₹${bal1} (Expected: 11998 - 5000 = 6998)`);

  if (paid1 !== 5000 || bal1 !== 6998) {
    throw new Error(`Balance calculation mismatch! Paid: ${paid1}, Balance: ${bal1}`);
  }
  if (orderAfterPay1.paymentStatus !== "Partially Paid") {
    throw new Error(`Payment status mismatch! Expected 'Partially Paid', got '${orderAfterPay1.paymentStatus}'`);
  }
  console.log(`   [✓] Updated Order Payment Status: '${orderAfterPay1.paymentStatus}'`);

  // Verify that order.status is STILL 'Pending Confirmation' (Payment alone does NOT confirm project!)
  if (orderAfterPay1.status !== "Pending Confirmation") {
    throw new Error(
      `SECURITY FAILURE: Recording payment automatically confirmed project! Expected 'Pending Confirmation', got '${orderAfterPay1.status}'`
    );
  }
  console.log(`   [✓] Separation of Concerns Verified: Project status remains '${orderAfterPay1.status}'`);

  // -------------------------------------------------------------------------
  // TEST 8: Explicit Project Confirmation
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 8: Explicit Admin Project Confirmation...");
  const confirmRes = await apiRequest(
    `/api/admin/orders/${orderA.id}/confirm`,
    "POST",
    { notes: "Kickoff call scheduled for Monday 10:00 AM." },
    adminSession.cookie
  );

  if (confirmRes.response.status !== 200 || confirmRes.data?.order?.status !== "Confirmed") {
    throw new Error(`Project confirmation failed: ${JSON.stringify(confirmRes.data)}`);
  }
  console.log(`   [✓] Explicit Project Confirmation: Status updated to 'Confirmed'`);

  // -------------------------------------------------------------------------
  // TEST 9: Settlement Payment & Final State
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 9: Final Payment Settlement in Append-Only Ledger...");
  // Record remaining balance payment of ₹6,998
  const finalPaymentPayload = {
    amount: 6998,
    paymentMethod: "Bank IMPS",
    paymentReference: "UTR987654329999",
    notes: "Final milestone settlement received.",
  };

  const pay2Res = await apiRequest(
    `/api/admin/orders/${orderA.id}/payments`,
    "POST",
    finalPaymentPayload,
    adminSession.cookie
  );

  const { order: orderSettled, totalPaid: finalPaid, remainingBalance: finalBal } = pay2Res.data;
  console.log(`   [✓] Final Payment Recorded (Total Paid: ₹${finalPaid}, Balance: ₹${finalBal})`);

  if (finalPaid !== 11998 || finalBal !== 0) {
    throw new Error(`Final balance mismatch! Paid: ${finalPaid}, Balance: ${finalBal}`);
  }
  if (orderSettled.paymentStatus !== "Paid") {
    throw new Error(`Final payment status mismatch! Expected 'Paid', got '${orderSettled.paymentStatus}'`);
  }
  console.log(`   [✓] Order Payment Status fully settled: '${orderSettled.paymentStatus}'`);

  // -------------------------------------------------------------------------
  // TEST 10: Customer Real-Time Order Tracking Verification
  // -------------------------------------------------------------------------
  console.log("\n-> TEST 10: Customer Order Tracking Verification...");
  const custTrackingRes = await apiRequest(`/api/orders/${orderA.id}`, "GET", null, alphaSession.cookie);
  const trackingData = custTrackingRes.data;

  if (
    trackingData.order.status !== "Confirmed" ||
    trackingData.order.paymentStatus !== "Paid" ||
    trackingData.totalPaid !== 11998 ||
    trackingData.remainingBalance !== 0 ||
    trackingData.payments.length !== 2
  ) {
    throw new Error(`Customer tracking data mismatch: ${JSON.stringify(trackingData)}`);
  }

  console.log(`   [✓] Customer verified tracking details:`);
  console.log(`       • Order ID:          ${trackingData.order.id}`);
  console.log(`       • Project Status:    ${trackingData.order.status}`);
  console.log(`       • Payment Status:    ${trackingData.order.paymentStatus}`);
  console.log(`       • Verified Paid:     ₹${trackingData.totalPaid}`);
  console.log(`       • Remaining Balance: ₹${trackingData.remainingBalance}`);
  console.log(`       • Ledger Entries:    ${trackingData.payments.length} verified records`);

  console.log("\n======================================================================");
  console.log("ALL 10 ORDER LIFECYCLE & WHATSAPP COMMERCE TESTS PASSED!");
  console.log("======================================================================\n");

  await sqlClient.end();
}

try {
  await runOrderLifecycleTests();
  process.exit(0);
} catch (error) {
  console.error("\nTEST SUITE FAILED:", error);
  try {
    await sqlClient.end();
  } catch {}
  process.exit(1);
}
