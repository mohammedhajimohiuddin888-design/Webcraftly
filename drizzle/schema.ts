import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
  index,
  uniqueIndex,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================================================
// 1. BETTER AUTH CORE TABLES (Zero-PII: No Session IP Storage)
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("customer").notNull(), // 'customer' | 'admin'
  phone: text("phone").default("").notNull(),
  businessName: text("business_name").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)]
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// 2. CANONICAL CUSTOMER IDENTITY TABLE
// ============================================================================

export const customers = pgTable(
  "customers",
  {
    id: varchar("id", { length: 80 }).primaryKey(), // cust_...
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }), // Linked ONLY after email verification
    name: varchar("name", { length: 120 }).notNull(),
    normalizedEmail: varchar("normalized_email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    businessName: varchar("business_name", { length: 160 }),
    isVerifiedAccount: boolean("is_verified_account").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("customers_normalized_email_idx").on(table.normalizedEmail),
    index("customers_phone_idx").on(table.phone),
    uniqueIndex("customers_user_id_unique_idx")
      .on(table.userId)
      .where(sql`${table.userId} IS NOT NULL`),
  ]
);

// ============================================================================
// 3. CATALOG & SHOWCASE TABLES
// ============================================================================

export const services = pgTable(
  "services",
  {
    slug: varchar("slug", { length: 80 }).primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    badge: varchar("badge", { length: 60 }),
    iconName: varchar("icon_name", { length: 40 }).notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    startingPrice: integer("starting_price").notNull(), // INR
    featured: boolean("featured").default(false).notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    includes: jsonb("includes").default([]).notNull(),
    benefits: jsonb("benefits").default([]).notNull(),
    technologies: jsonb("technologies").default([]).notNull(),
    process: jsonb("process").default([]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("services_category_idx").on(table.category)]
);

export const servicePackages = pgTable(
  "service_packages",
  {
    id: varchar("id", { length: 80 }).primaryKey(),
    serviceSlug: varchar("service_slug", { length: 80 })
      .notNull()
      .references(() => services.slug, { onDelete: "cascade" }),
    tier: varchar("tier", { length: 30 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    tagline: text("tagline"),
    price: integer("price").notNull(), // INR
    originalPrice: integer("original_price"),
    deliveryDays: integer("delivery_days").notNull(),
    revisions: varchar("revisions", { length: 40 }).notNull(),
    popular: boolean("popular").default(false).notNull(),
    features: jsonb("features").default([]).notNull(),
    deliverables: jsonb("deliverables").default([]).notNull(),
    comparisonAttributes: jsonb("comparison_attributes").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("packages_service_slug_idx").on(table.serviceSlug)]
);

export const serviceAddons = pgTable(
  "service_addons",
  {
    id: varchar("id", { length: 80 }).primaryKey(),
    serviceSlug: varchar("service_slug", { length: 80 })
      .notNull()
      .references(() => services.slug, { onDelete: "cascade" }),
    name: varchar("name", { length: 140 }).notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(), // INR
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("addons_service_slug_idx").on(table.serviceSlug)]
);

export const galleryThemes = pgTable("gallery_themes", {
  id: varchar("id", { length: 80 }).primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  category: varchar("category", { length: 60 }).notNull(),
  type: varchar("type", { length: 40 }).notNull(),
  description: text("description").notNull(),
  technologies: jsonb("technologies").default([]).notNull(),
  metrics: varchar("metrics", { length: 120 }),
  client: varchar("client", { length: 120 }),
  previewUrl: text("preview_url"),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// 4. ORDERS & APPEND-ONLY PAYMENT LEDGER TABLES
// ============================================================================

export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 40 }).primaryKey(), // WC-2026-XXXXX
    customerId: varchar("customer_id", { length: 80 })
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 40 }).notNull(),
    customerBusinessName: varchar("customer_business_name", { length: 160 }),
    projectDescription: text("project_description").notNull(),
    referenceUrl: text("reference_url"),
    requiredFeatures: text("required_features"),
    specialInstructions: text("special_instructions"),
    deliveryTimeline: varchar("delivery_timeline", { length: 80 }).notNull(),
    items: jsonb("items").notNull(),
    subtotal: integer("subtotal").notNull(), // INR (Server-Validated)
    discount: integer("discount").default(0).notNull(),
    total: integer("total").notNull(), // INR (Server-Validated)
    paymentMethod: varchar("payment_method", { length: 40 })
      .default("whatsapp_manual")
      .notNull(),
    paymentStatus: varchar("payment_status", { length: 40 })
      .default("Awaiting Payment")
      .notNull(), // 'Awaiting Payment' | 'Partially Paid' | 'Paid' | 'Overpaid' | 'Refunded'
    status: varchar("status", { length: 30 })
      .default("Pending Confirmation")
      .notNull(), // 'Pending Confirmation' | 'Confirmed' | 'In Progress' | 'Under Review' | 'Completed' | 'Cancelled'
    adminNotes: text("admin_notes"), // Admin-only private notes
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("orders_customer_id_idx").on(table.customerId),
    index("orders_user_id_idx").on(table.userId),
    index("orders_customer_email_idx").on(table.customerEmail),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
  ]
);

export const payments = pgTable(
  "payments",
  {
    id: varchar("id", { length: 80 }).primaryKey(), // PAY-MANUAL-XXXXX
    orderId: varchar("order_id", { length: 40 })
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    type: varchar("type", { length: 30 }).default("payment").notNull(), // 'payment' | 'reversal' | 'adjustment'
    reversalOfPaymentId: varchar("reversal_of_payment_id", { length: 80 }).references(
      (): AnyPgColumn => payments.id,
      { onDelete: "restrict" }
    ),
    amount: integer("amount").notNull(), // Positive integer in INR
    paymentMethod: varchar("payment_method", { length: 60 }).notNull(), // 'UPI', 'Bank Transfer (IMPS/NEFT)', 'GPay / PhonePe / Paytm', 'Cash/Cheque', 'Other'
    paymentReference: varchar("payment_reference", { length: 120 }), // UTR number / Bank Ref
    idempotencyKey: varchar("idempotency_key", { length: 120 }).unique(), // Idempotency guard against duplicate submits
    verifiedByAdminId: text("verified_by_admin_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    notes: text("notes"),
    paymentDate: timestamp("payment_date").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    check("payments_positive_amount_check", sql`${table.amount} > 0`),
    check(
      "payments_type_check",
      sql`${table.type} IN ('payment', 'reversal', 'adjustment')`
    ),
    check(
      "payments_reversal_ref_check",
      sql`(${table.type} = 'reversal' AND ${table.reversalOfPaymentId} IS NOT NULL) OR (${table.type} != 'reversal')`
    ),
    index("payments_order_id_idx").on(table.orderId),
    index("payments_verified_by_admin_id_idx").on(table.verifiedByAdminId),
    index("payments_reversal_of_idx").on(table.reversalOfPaymentId),
    index("payments_idempotency_key_idx").on(table.idempotencyKey),
  ]
);

// ============================================================================
// 5. INQUIRIES & ATTACHMENTS TABLES
// ============================================================================

export const serviceInquiries = pgTable(
  "service_inquiries",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    customerId: varchar("customer_id", { length: 80 })
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    businessName: varchar("business_name", { length: 160 }),
    requiredService: varchar("required_service", { length: 160 }).notNull(),
    budget: varchar("budget", { length: 80 }).notNull(),
    timeline: varchar("timeline", { length: 120 }).notNull(),
    projectDescription: text("project_description").notNull(),
    referenceUrl: text("reference_url"),
    additionalRequirements: text("additional_requirements"),
    status: varchar("status", { length: 40 }).default("New").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("inquiries_customer_id_idx").on(table.customerId),
    index("inquiries_user_id_idx").on(table.userId),
    index("inquiries_status_idx").on(table.status),
  ]
);

export const projectAttachments = pgTable(
  "project_attachments",
  {
    id: varchar("id", { length: 80 }).primaryKey(),
    orderId: varchar("order_id", { length: 40 }).references(() => orders.id, {
      onDelete: "cascade",
    }),
    inquiryId: varchar("inquiry_id", { length: 40 }).references(
      () => serviceInquiries.id,
      { onDelete: "cascade" }
    ),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"),
    mimeType: varchar("mime_type", { length: 100 }),
    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    check(
      "attachment_exclusive_parent_check",
      sql`(${table.orderId} IS NOT NULL AND ${table.inquiryId} IS NULL) OR (${table.orderId} IS NULL AND ${table.inquiryId} IS NOT NULL)`
    ),
    index("attachments_order_id_idx").on(table.orderId),
    index("attachments_inquiry_id_idx").on(table.inquiryId),
  ]
);

// ============================================================================
// 6. PRIVACY-CONSCIOUS VISITOR ANALYTICS TABLE (Sanitized Referrers)
// ============================================================================

export const visitorAnalytics = pgTable(
  "visitor_analytics",
  {
    id: serial("id").primaryKey(),
    path: varchar("path", { length: 255 }).notNull(),
    referrer: text("referrer"), // Stripped of query strings and fragments
    deviceCategory: varchar("device_category", { length: 30 }),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("analytics_path_idx").on(table.path),
    index("analytics_timestamp_idx").on(table.timestamp),
  ]
);
