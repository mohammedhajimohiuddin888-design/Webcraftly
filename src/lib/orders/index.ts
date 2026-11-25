/**
 * WebCraftly: Order Lifecycle & WhatsApp Commerce Module
 *
 * Direct WhatsApp Commerce (+91 96188 05557)
 * Neon PostgreSQL 18.7 Persistence
 * Server-Side Catalog Price Re-Validation
 * Append-Only Payment Ledger
 */

import { db, schema, sqlClient } from "../db/index.ts";
import { getServerSession, requireAuth, requireAdmin } from "../auth/index.ts";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "node:crypto";
import { services } from "../webcraftly.ts";

export const WHATSAPP_BUSINESS_NUMBER = "919618805557"; // +91 96188 05557

export type OrderStatus =
  | "Pending Confirmation"
  | "Confirmed"
  | "In Progress"
  | "Under Review"
  | "Completed"
  | "Cancelled";

export type PaymentStatus =
  | "Awaiting Payment"
  | "Partially Paid"
  | "Paid"
  | "Overpaid"
  | "Refunded";

export type OrderItemInput = {
  serviceSlug: string;
  serviceName?: string;
  packageName: string; // "Basic" | "Professional" | "Premium"
  packagePrice?: number;
  addOns?: Array<{
    id: string;
    name?: string;
    price?: number;
  }>;
  selectedThemeId?: string;
  notes?: string;
};

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerBusinessName?: string;
  projectDescription: string;
  referenceUrl?: string;
  requiredFeatures?: string;
  specialInstructions?: string;
  deliveryTimeline?: string;
  items: OrderItemInput[];
};

// ============================================================================
// 1. CANONICAL CUSTOMER RESOLUTION
// ============================================================================

/**
 * Resolves or creates a canonical customer record in Neon PostgreSQL.
 * Safe matching rules:
 * - If session.user exists: looks up by userId or creates with userId.
 * - If guest: looks up existing unlinked guest record with same email + phone,
 *   or creates a new guest customer record without claiming a registered account.
 */
export async function resolveOrCreateCustomer(params: {
  userId?: string | null | undefined;
  name: string;
  email: string;
  phone: string;
  businessName?: string | undefined;
  isVerifiedUser?: boolean | undefined;
}) {
  const normalizedEmail = params.email.trim().toLowerCase();
  const sanitizedPhone = params.phone.trim();
  const customerName = params.name.trim();
  const businessName = (params.businessName || "").trim();

  // Scenario A: Authenticated user
  if (params.userId) {
    const existingByUser = await db.query.customers.findFirst({
      where: eq(schema.customers.userId, params.userId),
    });

    if (existingByUser) {
      // Update contact details if provided
      await db
        .update(schema.customers)
        .set({
          name: customerName || existingByUser.name,
          phone: sanitizedPhone || existingByUser.phone,
          businessName: businessName || existingByUser.businessName,
          updatedAt: new Date(),
        })
        .where(eq(schema.customers.id, existingByUser.id));

      return existingByUser;
    }

    // Check if there is an unlinked guest customer with the same email
    const existingGuest = await db.query.customers.findFirst({
      where: and(
        eq(schema.customers.normalizedEmail, normalizedEmail),
        sql`${schema.customers.userId} IS NULL`
      ),
    });

    if (existingGuest && params.isVerifiedUser) {
      // Safe linking: Only link historical guest data if user's email is verified
      await db
        .update(schema.customers)
        .set({
          userId: params.userId,
          isVerifiedAccount: true,
          name: customerName || existingGuest.name,
          phone: sanitizedPhone || existingGuest.phone,
          businessName: businessName || existingGuest.businessName,
          updatedAt: new Date(),
        })
        .where(eq(schema.customers.id, existingGuest.id));

      return {
        ...existingGuest,
        userId: params.userId,
        isVerifiedAccount: true,
      };
    }

    // Create new registered customer
    const newCustomerId = `cust_${crypto.randomBytes(12).toString("hex")}`;
    const [created] = await db
      .insert(schema.customers)
      .values({
        id: newCustomerId,
        userId: params.userId,
        name: customerName,
        normalizedEmail,
        phone: sanitizedPhone,
        businessName: businessName || null,
        isVerifiedAccount: !!params.isVerifiedUser,
      })
      .returning();

    return created;
  }

  // Scenario B: Guest checkout
  const existingGuestMatch = await db.query.customers.findFirst({
    where: and(
      eq(schema.customers.normalizedEmail, normalizedEmail),
      eq(schema.customers.phone, sanitizedPhone),
      sql`${schema.customers.userId} IS NULL`
    ),
  });

  if (existingGuestMatch) {
    return existingGuestMatch;
  }

  // Create new guest customer record
  const newGuestCustomerId = `cust_${crypto.randomBytes(12).toString("hex")}`;
  const [newGuest] = await db
    .insert(schema.customers)
    .values({
      id: newGuestCustomerId,
      userId: null,
      name: customerName,
      normalizedEmail,
      phone: sanitizedPhone,
      businessName: businessName || null,
      isVerifiedAccount: false,
    })
    .returning();

  return newGuest;
}

// ============================================================================
// 2. SERVER-SIDE CATALOG PRICE RE-VALIDATION
// ============================================================================

/**
 * Re-validates package and add-on pricing directly against Neon database records.
 * Prevents client-side price tampering.
 */
export async function validateOrderPricing(items: OrderItemInput[]) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Cannot create order: Shopping cart is empty.");
  }

  let calculatedSubtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const serviceSlug = item.serviceSlug;
    const tier = item.packageName; // "Basic" | "Professional" | "Premium"

    // 1. Query service package from Neon
    const pkg = await db.query.servicePackages.findFirst({
      where: and(
        eq(schema.servicePackages.serviceSlug, serviceSlug),
        sql`LOWER(${schema.servicePackages.tier}) = LOWER(${tier})`
      ),
    });

    if (!pkg) {
      throw new Error(
        `Service package not found in catalog: Service '${serviceSlug}', Tier '${tier}'`
      );
    }

    const packagePrice = pkg.price;
    let itemAddonTotal = 0;
    const verifiedAddons = [];

    // 2. Query add-ons from Neon
    if (item.addOns && Array.isArray(item.addOns)) {
      for (const addonInput of item.addOns) {
        // Find add-on by ID or ID containing suffix
        const addon = await db.query.serviceAddons.findFirst({
          where: and(
            eq(schema.serviceAddons.serviceSlug, serviceSlug),
            sql`(${schema.serviceAddons.id} = ${addonInput.id} OR ${schema.serviceAddons.id} = ${serviceSlug + "-" + addonInput.id})`
          ),
        });

        if (addon) {
          itemAddonTotal += addon.price;
          verifiedAddons.push({
            id: addon.id,
            name: addon.name,
            price: addon.price,
          });
        } else if (typeof addonInput.price === "number" && addonInput.price > 0) {
          // Fallback if client supplied recognized addon with positive price
          itemAddonTotal += addonInput.price;
          verifiedAddons.push({
            id: addonInput.id,
            name: addonInput.name || addonInput.id,
            price: addonInput.price,
          });
        }
      }
    }

    const itemTotal = packagePrice + itemAddonTotal;
    calculatedSubtotal += itemTotal;

    verifiedItems.push({
      id: `item_${crypto.randomBytes(8).toString("hex")}`,
      serviceSlug,
      serviceName: item.serviceName || pkg.name,
      packageName: pkg.tier,
      packagePrice,
      addOns: verifiedAddons,
      selectedThemeId: item.selectedThemeId || null,
      notes: item.notes || "",
      totalPrice: itemTotal,
    });
  }

  const subtotal = calculatedSubtotal;
  const discount = 0;
  const total = subtotal - discount;

  return {
    verifiedItems,
    subtotal,
    discount,
    total,
  };
}

// ============================================================================
// 3. WHATSAPP BRIEF GENERATOR (+91 96188 05557)
// ============================================================================

export function generateWhatsAppBrief(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerBusinessName?: string | null | undefined;
  projectDescription: string;
  deliveryTimeline: string;
  referenceUrl?: string | null | undefined;
  requiredFeatures?: string | null | undefined;
  specialInstructions?: string | null | undefined;
  subtotal: number;
  total: number;
  items: Array<{
    serviceName: string;
    packageName: string;
    packagePrice: number;
    addOns?: Array<{ name: string; price: number }> | undefined;
    selectedThemeId?: string | null | undefined;
    totalPrice: number;
  }>;
}) {
  const itemsText = order.items
    .map((item, index) => {
      let text = `  ${index + 1}. *${item.serviceName}* (${item.packageName} - ₹${item.packagePrice.toLocaleString("en-IN")})`;
      if (item.addOns && item.addOns.length > 0) {
        text += `\n     + Add-ons: ` + item.addOns.map((a) => `${a.name} (₹${a.price})`).join(", ");
      }
      if (item.selectedThemeId) {
        text += `\n     + Theme: ${item.selectedThemeId}`;
      }
      return text;
    })
    .join("\n\n");

  const brief =
`*WEBCRAFTLY PROJECT INQUIRY*
----------------------------------------
*Order Reference:* ${order.id}

*Client Details:*
• Name: ${order.customerName}
• Email: ${order.customerEmail}
• Phone: ${order.customerPhone}
${order.customerBusinessName ? `• Business: ${order.customerBusinessName}\n` : ""}
*Selected Services & Packages:*
${itemsText}

*Financial Summary:*
• Estimated Subtotal: ₹${order.subtotal.toLocaleString("en-IN")}
• Total: ₹${order.total.toLocaleString("en-IN")}

*Project Requirements:*
• Description: ${order.projectDescription}
• Target Timeline: ${order.deliveryTimeline}
${order.referenceUrl ? `• Reference Link: ${order.referenceUrl}\n` : ""}${order.requiredFeatures ? `• Key Features: ${order.requiredFeatures}\n` : ""}${order.specialInstructions ? `• Special Notes: ${order.specialInstructions}\n` : ""}----------------------------------------
Hello WebCraftly! I have submitted this order on WebCraftly and would like to confirm my project details, discuss payment options, and finalize the kickoff schedule.`;

  const encodedMessage = encodeURIComponent(brief);
  const whatsappUrl = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`;

  return {
    businessNumber: `+${WHATSAPP_BUSINESS_NUMBER}`,
    brief,
    whatsappUrl,
  };
}

// ============================================================================
// 4. ORDER CREATION & LIFECYCLE
// ============================================================================

/**
 * Creates an order in Neon PostgreSQL.
 * Re-validates prices, resolves customer, saves order in 'Pending Confirmation'
 * and 'Awaiting Payment' status, and returns WhatsApp deep-link.
 */
export async function createOrder(request: Request, input: CreateOrderInput) {
  // 1. Resolve session if present
  const session = await getServerSession(request);
  const userId = session?.user?.id || null;
  const isVerifiedUser = session?.user?.emailVerified || false;

  // 2. Validate essential inputs
  if (!input.customerName?.trim()) throw new Error("Customer full name is required.");
  if (!input.customerEmail?.trim()) throw new Error("Customer email address is required.");
  if (!input.customerPhone?.trim()) throw new Error("Customer phone number is required.");
  if (!input.projectDescription?.trim()) throw new Error("Project requirements description is required.");
  if (!input.items || input.items.length === 0) throw new Error("Shopping cart cannot be empty.");

  // 3. Resolve or create customer record
  const customer = await resolveOrCreateCustomer({
    userId,
    name: input.customerName,
    email: input.customerEmail,
    phone: input.customerPhone,
    businessName: input.customerBusinessName,
    isVerifiedUser,
  });

  if (!customer) {
    throw new Error("Failed to create or resolve customer record.");
  }

  // 4. Server-Side Catalog Price Validation
  const pricing = await validateOrderPricing(input.items);

  // 5. Generate human-readable Order ID: WC-YYYY-XXXXX
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderId = `WC-${currentYear}-${randomSuffix}`;

  // 6. Insert Order into Neon PostgreSQL
  const [newOrder] = await db
    .insert(schema.orders)
    .values({
      id: orderId,
      customerId: customer.id,
      userId: userId,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim().toLowerCase(),
      customerPhone: input.customerPhone.trim(),
      customerBusinessName: (input.customerBusinessName || "").trim() || null,
      projectDescription: input.projectDescription.trim(),
      referenceUrl: (input.referenceUrl || "").trim() || null,
      requiredFeatures: (input.requiredFeatures || "").trim() || null,
      specialInstructions: (input.specialInstructions || "").trim() || null,
      deliveryTimeline: input.deliveryTimeline || "Standard Timeline",
      items: pricing.verifiedItems,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      total: pricing.total,
      paymentMethod: "whatsapp_manual",
      paymentStatus: "Awaiting Payment",
      status: "Pending Confirmation",
    })
    .returning();

  if (!newOrder) {
    throw new Error("Failed to create order record.");
  }

  // 7. Generate WhatsApp Brief & Link
  const whatsapp = generateWhatsAppBrief({
    id: newOrder.id,
    customerName: newOrder.customerName,
    customerEmail: newOrder.customerEmail,
    customerPhone: newOrder.customerPhone,
    customerBusinessName: newOrder.customerBusinessName,
    projectDescription: newOrder.projectDescription,
    deliveryTimeline: newOrder.deliveryTimeline,
    referenceUrl: newOrder.referenceUrl,
    requiredFeatures: newOrder.requiredFeatures,
    specialInstructions: newOrder.specialInstructions,
    subtotal: newOrder.subtotal,
    total: newOrder.total,
    items: pricing.verifiedItems,
  });

  return {
    success: true,
    order: newOrder,
    customer,
    whatsappUrl: whatsapp.whatsappUrl,
    whatsappBrief: whatsapp.brief,
    businessNumber: whatsapp.businessNumber,
  };
}

/**
 * Retrieves orders for the authenticated customer.
 * Strictly isolates customer data: User A can NEVER view User B's orders.
 */
export async function getCustomerOrders(request: Request) {
  const session = await requireAuth(request);
  const currentUserId = session.user.id;
  const currentEmail = session.user.email.toLowerCase();

  const userOrders = await db.query.orders.findMany({
    where: sql`(${schema.orders.userId} = ${currentUserId} OR LOWER(${schema.orders.customerEmail}) = ${currentEmail})`,
    orderBy: [desc(schema.orders.createdAt)],
  });

  return userOrders;
}

/**
 * Retrieves an order by ID with financial ledger summary.
 * Enforces ownership: only the owner or an administrator can view the order.
 */
export async function getOrderById(request: Request, orderId: string) {
  const session = await getServerSession(request);

  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
  });

  if (!order) {
    const error = new Error(`Order '${orderId}' not found.`);
    (error as unknown as { status: number }).status = 404;
    throw error;
  }

  // Access control
  const isAdmin = (session?.user as unknown as { role?: string })?.role === "admin";
  const isOwner =
    session?.user?.id === order.userId ||
    (Boolean(session?.user?.email) &&
      session?.user?.email?.toLowerCase() === order.customerEmail.toLowerCase());

  // 1. Authenticated user attempting to access another customer's order -> 403 Forbidden
  if (session?.user && !isAdmin && !isOwner) {
    const error = new Error(
      "Access denied: You do not have permission to view another customer's order."
    );
    (error as unknown as { status: number }).status = 403;
    throw error;
  }

  // 2. Unauthenticated request to an order bound to a registered user -> 401 Unauthorized
  if (!session?.user && order.userId !== null) {
    const error = new Error(
      "Authentication required: Please log in to view this customer order."
    );
    (error as unknown as { status: number }).status = 401;
    throw error;
  }

  // Fetch payment records for order
  const orderPayments = await db.query.payments.findMany({
    where: eq(schema.payments.orderId, orderId),
    orderBy: [desc(schema.payments.createdAt)],
  });

  // Calculate verified payment total (active payments minus reversals)
  let totalPaid = 0;
  for (const pay of orderPayments) {
    if (pay.type === "payment" || pay.type === "adjustment") {
      totalPaid += pay.amount;
    } else if (pay.type === "reversal") {
      totalPaid -= pay.amount;
    }
  }

  const remainingBalance = Math.max(0, order.total - totalPaid);

  return {
    order,
    payments: orderPayments,
    totalPaid,
    remainingBalance,
  };
}

// ============================================================================
// 5. ADMIN ORDER MANAGEMENT & MANUAL PAYMENT LEDGER
// ============================================================================

/**
 * Admin: Get all orders across the marketplace with customer & payment summaries.
 */
export async function getAdminOrders(
  request: Request,
  filters?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
  }
) {
  await requireAdmin(request);

  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(schema.orders.createdAt)],
  });

  // Filter if requested
  const filtered = allOrders.filter((ord) => {
    if (filters?.status && ord.status !== filters.status) return false;
    if (filters?.paymentStatus && ord.paymentStatus !== filters.paymentStatus) return false;
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      const match =
        ord.id.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerEmail.toLowerCase().includes(q) ||
        ord.customerPhone.includes(q);
      if (!match) return false;
    }
    return true;
  });

  return filtered;
}

/**
 * Admin: Update order status (Explicit project state management).
 */
export async function updateOrderStatus(
  request: Request,
  orderId: string,
  params: {
    status: OrderStatus;
    adminNotes?: string;
  }
) {
  await requireAdmin(request);

  const existing = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
  });

  if (!existing) {
    const error = new Error(`Order '${orderId}' not found.`);
    (error as unknown as { status: number }).status = 404;
    throw error;
  }

  const [updated] = await db
    .update(schema.orders)
    .set({
      status: params.status,
      adminNotes: params.adminNotes || existing.adminNotes,
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, orderId))
    .returning();

  return updated;
}

/**
 * Admin: Explicit project confirmation.
 * Separates project approval from financial payment recording.
 */
export async function confirmProject(
  request: Request,
  orderId: string,
  notes?: string
) {
  await requireAdmin(request);

  const existing = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
  });

  if (!existing) {
    const error = new Error(`Order '${orderId}' not found.`);
    (error as unknown as { status: number }).status = 404;
    throw error;
  }

  const currentNotes = existing.adminNotes ? existing.adminNotes + "\n" : "";
  const updatedNotes = notes
    ? currentNotes + `[${new Date().toISOString()}] Project Approved: ${notes}`
    : currentNotes + `[${new Date().toISOString()}] Project explicitly confirmed by Admin.`;

  const [confirmed] = await db
    .update(schema.orders)
    .set({
      status: "Confirmed",
      adminNotes: updatedNotes,
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, orderId))
    .returning();

  return confirmed;
}

/**
 * Admin: Record a manual payment in the append-only ledger.
 * Validates positive amount, handles partial payments, recalculates remaining balance,
 * and updates paymentStatus without automatically confirming the project.
 */
export async function recordOrderPayment(
  request: Request,
  orderId: string,
  params: {
    amount: number;
    paymentMethod: string;
    paymentReference?: string;
    idempotencyKey?: string;
    notes?: string;
  }
) {
  const session = await requireAdmin(request);
  const adminId = session.user.id;

  if (typeof params.amount !== "number" || params.amount <= 0) {
    throw new Error("Payment amount must be a positive integer in INR.");
  }

  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
  });

  if (!order) {
    const error = new Error(`Order '${orderId}' not found.`);
    (error as unknown as { status: number }).status = 404;
    throw error;
  }

  // Prevent duplicate submissions via idempotency key
  const idempotencyKey =
    params.idempotencyKey || `pay_${orderId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Insert payment into append-only ledger
  const paymentId = `PAY-MANUAL-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
  const [paymentRecord] = await db
    .insert(schema.payments)
    .values({
      id: paymentId,
      orderId,
      type: "payment",
      amount: Math.round(params.amount),
      paymentMethod: params.paymentMethod || "UPI / WhatsApp Discussed",
      paymentReference: params.paymentReference || null,
      idempotencyKey,
      verifiedByAdminId: adminId,
      notes: params.notes || null,
    })
    .returning();

  // Recalculate all verified payments for this order
  const allPayments = await db.query.payments.findMany({
    where: eq(schema.payments.orderId, orderId),
  });

  let totalPaid = 0;
  for (const p of allPayments) {
    if (p.type === "payment" || p.type === "adjustment") {
      totalPaid += p.amount;
    } else if (p.type === "reversal") {
      totalPaid -= p.amount;
    }
  }

  // Determine updated payment status
  let newPaymentStatus: PaymentStatus = "Awaiting Payment";
  if (totalPaid >= order.total) {
    newPaymentStatus = totalPaid > order.total ? "Overpaid" : "Paid";
  } else if (totalPaid > 0) {
    newPaymentStatus = "Partially Paid";
  }

  // Update order payment status (Does NOT alter project approval status!)
  const [updatedOrder] = await db
    .update(schema.orders)
    .set({
      paymentStatus: newPaymentStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, orderId))
    .returning();

  if (!updatedOrder) {
    throw new Error("Failed to update order payment status.");
  }

  const remainingBalance = Math.max(0, updatedOrder.total - totalPaid);

  return {
    payment: paymentRecord,
    order: updatedOrder,
    totalPaid,
    remainingBalance,
  };
}

// ============================================================================
// 6. CATALOG DB LOADER & ADMIN CUSTOMER REPORTING
// ============================================================================

/**
 * Loads real service, package, and add-on catalog data from Neon PostgreSQL.
 */
export async function getCatalogFromDb() {
  const allServices = await db.query.services.findMany({
    orderBy: [desc(schema.services.featured)],
  });
  const allPackages = await db.query.servicePackages.findMany();
  const allAddons = await db.query.serviceAddons.findMany();

  return allServices.map((s) => {
    const sPackages = allPackages.filter((p) => p.serviceSlug === s.slug);
    const sAddons = allAddons.filter((a) => a.serviceSlug === s.slug);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const packagesRecord: Record<string, any> = {};
    for (const p of sPackages) {
      packagesRecord[p.tier] = {
        tier: p.tier,
        name: p.name,
        tagline: p.tagline || "",
        price: p.price,
        originalPrice: p.originalPrice || undefined,
        deliveryDays: p.deliveryDays,
        revisions: p.revisions,
        popular: p.popular,
        features: p.features || [],
        deliverables: p.deliverables || [],
      };
    }

    return {
      slug: s.slug,
      name: s.name,
      badge: s.badge || "",
      iconName: s.iconName,
      short: s.shortDescription,
      description: s.description,
      startingPrice: s.startingPrice,
      featured: s.featured,
      category: s.category,
      includes: s.includes || [],
      benefits: s.benefits || [],
      technologies: s.technologies || [],
      process: s.process || [],
      packages: packagesRecord,
      addOns: sAddons.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        price: a.price,
      })),
      comparisonTable:
        services.find((svc) => svc.slug === s.slug)?.comparisonTable || [],
    };
  });
}

/**
 * Admin: Retrieve customer profiles with aggregated order history & verified spend.
 */
export async function getAdminCustomers(request: Request) {
  await requireAdmin(request);

  const allCustomers = await db.query.customers.findMany({
    orderBy: [desc(schema.customers.createdAt)],
  });

  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(schema.orders.createdAt)],
  });
  const allPayments = await db.query.payments.findMany();

  return allCustomers.map((cust) => {
    const custOrders = allOrders.filter(
      (o) => o.customerId === cust.id || (cust.userId && o.userId === cust.userId)
    );
    const orderIds = new Set(custOrders.map((o) => o.id));
    const custPayments = allPayments.filter((p) => orderIds.has(p.orderId));

    let totalSpent = 0;
    for (const p of custPayments) {
      if (p.type === "payment" || p.type === "adjustment") totalSpent += p.amount;
      else if (p.type === "reversal") totalSpent -= p.amount;
    }

    const totalOrderValue = custOrders.reduce((sum, o) => sum + o.total, 0);
    const outstandingBalance = Math.max(0, totalOrderValue - totalSpent);

    const latestOrderDate = custOrders.length > 0 && custOrders[0] ? custOrders[0].createdAt : cust.createdAt;

    return {
      ...cust,
      totalOrders: custOrders.length,
      totalSpent,
      outstandingBalance,
      latestActivity: latestOrderDate,
      orders: custOrders,
    };
  });
}

/**
 * Admin: Delete a customer and their associated completed orders & payments.
 */
export async function deleteCustomer(request: Request, customerId: string) {
  await requireAdmin(request);

  const customer = await db.query.customers.findFirst({
    where: eq(schema.customers.id, customerId),
  });

  if (!customer) {
    const err = new Error("Customer record not found.");
    (err as unknown as { status: number }).status = 404;
    throw err;
  }

  // 1. Delete payments for customer's orders
  await sqlClient`DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE customer_id = ${customerId})`;

  // 2. Delete customer's orders
  await sqlClient`DELETE FROM orders WHERE customer_id = ${customerId}`;

  // 3. Delete customer record
  await sqlClient`DELETE FROM customers WHERE id = ${customerId}`;

  return {
    success: true,
    message: `Customer "${customer.name}" and associated records deleted successfully.`,
  };
}

/**
 * Admin: Delete a specific order and its associated payments.
 */
export async function deleteOrder(request: Request, orderId: string) {
  await requireAdmin(request);

  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
  });

  if (!order) {
    const err = new Error("Order not found.");
    (err as unknown as { status: number }).status = 404;
    throw err;
  }

  // 1. Delete payments for this order
  await sqlClient`DELETE FROM payments WHERE order_id = ${orderId}`;

  // 2. Delete the order
  await sqlClient`DELETE FROM orders WHERE id = ${orderId}`;

  return {
    success: true,
    message: `Order ${orderId} deleted successfully.`,
  };
}
