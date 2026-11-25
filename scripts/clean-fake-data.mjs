import { db, schema, sqlClient } from "../src/lib/db/index.ts";
import { inArray, or, ilike, eq } from "drizzle-orm";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

const REAL_EMAILS = [
  "mohammedhajimohiuddin888@gmail.com",
  "mdausafmohiuddin@gmail.com",
  "rizwanalisyed552@gmail.com",
  "hajimohiuddin1@gmail.com",
  "mohiuddinmdhaji@gmail.com",
];

async function cleanFakeData() {
  console.log("======================================================================");
  console.log("CLEANING FAKE TEST DATA FROM NEON POSTGRESQL");
  console.log("======================================================================\n");

  // 1. Identify fake orders
  const allOrders = await db.query.orders.findMany();
  const fakeOrders = allOrders.filter(o => {
    const email = (o.customerEmail || "").toLowerCase();
    const name = (o.customerName || "").toLowerCase();
    return (
      email.includes("@example.com") ||
      email.includes("@techcorp.in") ||
      name.includes("alpha merchant") ||
      name.includes("vikram malhotra")
    );
  });

  const fakeOrderIds = fakeOrders.map(o => o.id);
  console.log(`Found ${fakeOrderIds.length} fake orders to delete:`, fakeOrderIds);

  if (fakeOrderIds.length > 0) {
    // Delete payments referencing fake orders
    await sqlClient`DELETE FROM payments WHERE order_id = ANY(${fakeOrderIds})`;
    console.log("  ✓ Deleted payments for fake orders");

    // Delete fake orders
    await sqlClient`DELETE FROM orders WHERE id = ANY(${fakeOrderIds})`;
    console.log("  ✓ Deleted fake orders");
  }

  // 2. Identify fake customers
  const allCustomers = await db.query.customers.findMany();
  const fakeCustomers = allCustomers.filter(c => {
    const name = (c.name || "").toLowerCase();
    return name.includes("alpha merchant") || name.includes("vikram malhotra");
  });

  const fakeCustomerIds = fakeCustomers.map(c => c.id);
  console.log(`Found ${fakeCustomerIds.length} fake customers to delete:`, fakeCustomerIds);

  if (fakeCustomerIds.length > 0) {
    // Check if any remaining orders reference these customers
    await sqlClient`DELETE FROM orders WHERE customer_id = ANY(${fakeCustomerIds})`;
    await sqlClient`DELETE FROM customers WHERE id = ANY(${fakeCustomerIds})`;
    console.log("  ✓ Deleted fake customers");
  }

  // 3. Identify fake users
  const allUsers = await db.query.user.findMany();
  const fakeUsers = allUsers.filter(u => {
    const email = (u.email || "").toLowerCase();
    return (
      (email.includes("@example.com") || email.includes("@techcorp.in") || email.includes("@webcraftly.com")) &&
      !REAL_EMAILS.includes(email)
    );
  });

  const fakeUserIds = fakeUsers.map(u => u.id);
  console.log(`Found ${fakeUserIds.length} fake users to delete:`);

  if (fakeUserIds.length > 0) {
    await sqlClient`DELETE FROM session WHERE user_id = ANY(${fakeUserIds})`;
    await sqlClient`DELETE FROM account WHERE user_id = ANY(${fakeUserIds})`;
    await sqlClient`DELETE FROM "user" WHERE id = ANY(${fakeUserIds})`;
    console.log("  ✓ Deleted fake users and their sessions/accounts");
  }

  // 4. Report remaining data
  const remainingOrders = await db.query.orders.findMany();
  console.log(`\nRemaining Clean Orders: ${remainingOrders.length}`);
  console.table(remainingOrders.map(o => ({ id: o.id, customerName: o.customerName, email: o.customerEmail, total: o.total, status: o.status })));

  const remainingCustomers = await db.query.customers.findMany();
  console.log(`Remaining Clean Customers: ${remainingCustomers.length}`);
  console.table(remainingCustomers.map(c => ({ id: c.id, name: c.name, phone: c.phone })));

  const remainingUsers = await db.query.user.findMany();
  console.log(`Remaining Clean Users: ${remainingUsers.length}`);
  console.table(remainingUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));

  console.log("\nCleanup completed successfully!");
  process.exit(0);
}

cleanFakeData().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
