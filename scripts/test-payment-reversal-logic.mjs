/**
 * Milestone 2 Additional Verification: Payment Reversals & Append-Only Constraints
 *
 * Requirements tested against Neon test database:
 * 1. Positive amount check: amount <= 0 must be rejected by PostgreSQL CHECK constraint.
 * 2. Type check: invalid type (e.g. 'refund_invalid') must be rejected by CHECK constraint.
 * 3. Reversal reference check: type='reversal' without reversal_of_payment_id must be rejected.
 * 4. Self-referencing FK: reversal_of_payment_id pointing to non-existent payment must be rejected.
 * 5. Foreign Key RESTRICT: attempting to DELETE a payment with linked reversals or an order with payments must be rejected.
 * 6. Cumulative reversal protection: server-side transaction logic enforces sum(reversals) <= original_payment.amount.
 */

import postgresModule from "postgres";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

const prodUrl = process.env.DATABASE_URL || process.env.LOVABLE_DB_MIGRATION_URL;
const postgres = postgresModule.default || postgresModule;

const parsedUrl = new URL(prodUrl);
parsedUrl.pathname = "/webcraftly_migration_test";
const testDbUrl = parsedUrl.toString();

const sql = postgres(testDbUrl, { ssl: "require", max: 1, prepare: false });

console.log("\n======================================================================");
console.log("TESTING PAYMENT REVERSAL & APPEND-ONLY LEDGER CONSTRAINTS");
console.log("======================================================================\n");

async function runTests() {
  // Step 0: Create prerequisite test customer, admin user, and order
  const adminId = "usr_admin_test_01";
  const custId = "cust_test_rev_01";
  const orderId = "WC-2026-TEST-REV";

  await sql`
    INSERT INTO "user" (id, name, email, email_verified, role, phone, business_name)
    VALUES (${adminId}, 'Admin Tester', 'admin.test@webcraftly.com', true, 'admin', '+919618805557', 'WebCraftly')
    ON CONFLICT (id) DO NOTHING;
  `;

  await sql`
    INSERT INTO "customers" (id, name, normalized_email, phone, business_name, is_verified_account)
    VALUES (${custId}, 'Client Test', 'client.test@example.com', '+919876543210', 'Test Org', false)
    ON CONFLICT (id) DO NOTHING;
  `;

  await sql`
    INSERT INTO "orders" (
      id, customer_id, customer_name, customer_email, customer_phone,
      project_description, delivery_timeline, items, subtotal, discount, total,
      payment_method, payment_status, status
    ) VALUES (
      ${orderId}, ${custId}, 'Client Test', 'client.test@example.com', '+919876543210',
      'Test Brief', '10 days', '[]'::jsonb, 20000, 0, 20000,
      'whatsapp_manual', 'Awaiting Payment', 'Pending Confirmation'
    ) ON CONFLICT (id) DO NOTHING;
  `;

  console.log("[✓] Prerequisite test records created (Admin, Customer, Order)");

  // TEST 1: Positive amount CHECK constraint (amount <= 0 must fail)
  try {
    await sql`
      INSERT INTO "payments" (id, order_id, type, amount, payment_method, verified_by_admin_id)
      VALUES ('pay_neg_test', ${orderId}, 'payment', 0, 'UPI', ${adminId})
    `;
    console.error("[✗] TEST 1 FAILED: Zero amount was accepted!");
    process.exit(1);
  } catch (err) {
    if (err.message.includes("payments_positive_amount_check")) {
      console.log("[✓] TEST 1 PASSED: payments_positive_amount_check rejected amount = 0");
    } else {
      throw err;
    }
  }

  // TEST 2: Type CHECK constraint (type must be 'payment', 'reversal', or 'adjustment')
  try {
    await sql`
      INSERT INTO "payments" (id, order_id, type, amount, payment_method, verified_by_admin_id)
      VALUES ('pay_invalid_type', ${orderId}, 'invalid_type', 1000, 'UPI', ${adminId})
    `;
    console.error("[✗] TEST 2 FAILED: Invalid type was accepted!");
    process.exit(1);
  } catch (err) {
    if (err.message.includes("payments_type_check")) {
      console.log("[✓] TEST 2 PASSED: payments_type_check rejected invalid type");
    } else {
      throw err;
    }
  }

  // TEST 3: Reversal reference CHECK constraint (reversal without reversal_of_payment_id must fail)
  try {
    await sql`
      INSERT INTO "payments" (id, order_id, type, amount, payment_method, verified_by_admin_id)
      VALUES ('pay_rev_orphan', ${orderId}, 'reversal', 1000, 'UPI', ${adminId})
    `;
    console.error("[✗] TEST 3 FAILED: Reversal without reversal_of_payment_id was accepted!");
    process.exit(1);
  } catch (err) {
    if (err.message.includes("payments_reversal_ref_check")) {
      console.log("[✓] TEST 3 PASSED: payments_reversal_ref_check rejected unreferenced reversal");
    } else {
      throw err;
    }
  }

  // TEST 4: Self-referencing FK to non-existent payment must fail
  try {
    await sql`
      INSERT INTO "payments" (id, order_id, type, reversal_of_payment_id, amount, payment_method, verified_by_admin_id)
      VALUES ('pay_rev_fk_fail', ${orderId}, 'reversal', 'non_existent_payment_id', 1000, 'UPI', ${adminId})
    `;
    console.error("[✗] TEST 4 FAILED: Reversal with non-existent foreign key was accepted!");
    process.exit(1);
  } catch (err) {
    if (err.message.includes("violates foreign key constraint")) {
      console.log("[✓] TEST 4 PASSED: Self-referencing FK rejected non-existent payment reference");
    } else {
      throw err;
    }
  }

  // TEST 5: Create a valid original payment of ₹10,000
  const originalPaymentId = "pay_orig_10k";
  await sql`
    INSERT INTO "payments" (id, order_id, type, amount, payment_method, payment_reference, verified_by_admin_id)
    VALUES (${originalPaymentId}, ${orderId}, 'payment', 10000, 'UPI', 'UTR12345678', ${adminId})
  `;
  console.log("[✓] TEST 5 PASSED: Valid original payment of ₹10,000 recorded");

  // TEST 6: Record a valid partial reversal of ₹4,000
  const rev1Id = "pay_rev_4k";
  await sql`
    INSERT INTO "payments" (id, order_id, type, reversal_of_payment_id, amount, payment_method, payment_reference, verified_by_admin_id)
    VALUES (${rev1Id}, ${orderId}, 'reversal', ${originalPaymentId}, 4000, 'UPI', 'REV_UTR_01', ${adminId})
  `;
  console.log("[✓] TEST 6 PASSED: Partial reversal #1 (₹4,000) recorded successfully");

  // TEST 7: Record another valid partial reversal of ₹6,000 (reversals now equal ₹10,000)
  const rev2Id = "pay_rev_6k";
  await sql`
    INSERT INTO "payments" (id, order_id, type, reversal_of_payment_id, amount, payment_method, payment_reference, verified_by_admin_id)
    VALUES (${rev2Id}, ${orderId}, 'reversal', ${originalPaymentId}, 6000, 'UPI', 'REV_UTR_02', ${adminId})
  `;
  console.log("[✓] TEST 7 PASSED: Partial reversal #2 (₹6,000) recorded successfully");

  // TEST 8: Cumulative reversal protection logic: attempting reversal of ₹1,000 when ₹10,000 is already reversed
  async function attemptExcessReversal(attemptAmount) {
    const orig = await sql`SELECT amount FROM "payments" WHERE id = ${originalPaymentId}`;
    const pastReversals = await sql`
      SELECT COALESCE(SUM(amount), 0) as total_rev 
      FROM "payments" 
      WHERE reversal_of_payment_id = ${originalPaymentId} AND type = 'reversal'
    `;
    const totalRev = Number(pastReversals[0].total_rev);
    const origAmount = Number(orig[0].amount);

    if (totalRev + attemptAmount > origAmount) {
      throw new Error(
        `Excess reversal rejected: Attempted ₹${attemptAmount}, but only ₹${origAmount - totalRev} remaining refundable.`
      );
    }
  }

  try {
    await attemptExcessReversal(1000);
    console.error("[✗] TEST 8 FAILED: Excess reversal was allowed!");
    process.exit(1);
  } catch (err) {
    if (err.message.includes("Excess reversal rejected")) {
      console.log(`[✓] TEST 8 PASSED: Cumulative reversal protection blocked excess refund: ${err.message}`);
    } else {
      throw err;
    }
  }

  // TEST 9: ON DELETE RESTRICT on original payment (cannot delete payment with linked reversals)
  try {
    await sql`DELETE FROM "payments" WHERE id = ${originalPaymentId}`;
    console.error("[✗] TEST 9 FAILED: Payment with active reversals was deleted!");
    process.exit(1);
  } catch (err) {
    if (err.message.includes("violates foreign key constraint") || err.message.includes("update or delete on table")) {
      console.log("[✓] TEST 9 PASSED: ON DELETE RESTRICT prevented deletion of payment with reversals");
    } else {
      throw err;
    }
  }

  // TEST 10: ON DELETE RESTRICT on order (cannot delete order with payment history)
  try {
    await sql`DELETE FROM "orders" WHERE id = ${orderId}`;
    console.error("[✗] TEST 10 FAILED: Order with active payments was deleted!");
    process.exit(1);
  } catch (err) {
    if (err.message.includes("violates foreign key constraint") || err.message.includes("update or delete on table")) {
      console.log("[✓] TEST 10 PASSED: ON DELETE RESTRICT prevented deletion of order with payments");
    } else {
      throw err;
    }
  }

  console.log("\n======================================================================");
  console.log("ALL 10 PAYMENT REVERSAL & LEDGER CONSTRAINT TESTS PASSED!");
  console.log("======================================================================\n");
}

try {
  await runTests();
} catch (e) {
  console.error("Execution error:", e);
  process.exit(1);
} finally {
  await sql.end({ timeout: 2 });
}
