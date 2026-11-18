CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" varchar(120) NOT NULL,
	"normalized_email" varchar(255) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"business_name" varchar(160),
	"is_verified_account" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_themes" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"category" varchar(60) NOT NULL,
	"type" varchar(40) NOT NULL,
	"description" text NOT NULL,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metrics" varchar(120),
	"client" varchar(120),
	"preview_url" text,
	"image_url" text NOT NULL,
	"featured" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"customer_id" varchar(80) NOT NULL,
	"user_id" text,
	"customer_name" varchar(120) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(40) NOT NULL,
	"customer_business_name" varchar(160),
	"project_description" text NOT NULL,
	"reference_url" text,
	"required_features" text,
	"special_instructions" text,
	"delivery_timeline" varchar(80) NOT NULL,
	"items" jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"payment_method" varchar(40) DEFAULT 'whatsapp_manual' NOT NULL,
	"payment_status" varchar(40) DEFAULT 'Awaiting Payment' NOT NULL,
	"status" varchar(30) DEFAULT 'Pending Confirmation' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"order_id" varchar(40) NOT NULL,
	"type" varchar(30) DEFAULT 'payment' NOT NULL,
	"reversal_of_payment_id" varchar(80),
	"amount" integer NOT NULL,
	"payment_method" varchar(60) NOT NULL,
	"payment_reference" varchar(120),
	"idempotency_key" varchar(120),
	"verified_by_admin_id" text NOT NULL,
	"notes" text,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "payments_positive_amount_check" CHECK ("payments"."amount" > 0),
	CONSTRAINT "payments_type_check" CHECK ("payments"."type" IN ('payment', 'reversal', 'adjustment')),
	CONSTRAINT "payments_reversal_ref_check" CHECK (("payments"."type" = 'reversal' AND "payments"."reversal_of_payment_id" IS NOT NULL) OR ("payments"."type" != 'reversal'))
);
--> statement-breakpoint
CREATE TABLE "project_attachments" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"order_id" varchar(40),
	"inquiry_id" varchar(40),
	"file_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attachment_exclusive_parent_check" CHECK (("project_attachments"."order_id" IS NOT NULL AND "project_attachments"."inquiry_id" IS NULL) OR ("project_attachments"."order_id" IS NULL AND "project_attachments"."inquiry_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "service_addons" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"service_slug" varchar(80) NOT NULL,
	"name" varchar(140) NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_inquiries" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"customer_id" varchar(80) NOT NULL,
	"user_id" text,
	"full_name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"business_name" varchar(160),
	"required_service" varchar(160) NOT NULL,
	"budget" varchar(80) NOT NULL,
	"timeline" varchar(120) NOT NULL,
	"project_description" text NOT NULL,
	"reference_url" text,
	"additional_requirements" text,
	"status" varchar(40) DEFAULT 'New' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_packages" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"service_slug" varchar(80) NOT NULL,
	"tier" varchar(30) NOT NULL,
	"name" varchar(120) NOT NULL,
	"tagline" text,
	"price" integer NOT NULL,
	"original_price" integer,
	"delivery_days" integer NOT NULL,
	"revisions" varchar(40) NOT NULL,
	"popular" boolean DEFAULT false NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deliverables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"comparison_attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"slug" varchar(80) PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"badge" varchar(60),
	"icon_name" varchar(40) NOT NULL,
	"short_description" text NOT NULL,
	"description" text NOT NULL,
	"starting_price" integer NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"category" varchar(60) NOT NULL,
	"includes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"process" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"business_name" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" varchar(255) NOT NULL,
	"referrer" text,
	"device_category" varchar(30),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_reversal_of_payment_id_payments_id_fk" FOREIGN KEY ("reversal_of_payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_admin_id_user_id_fk" FOREIGN KEY ("verified_by_admin_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachments" ADD CONSTRAINT "project_attachments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachments" ADD CONSTRAINT "project_attachments_inquiry_id_service_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."service_inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachments" ADD CONSTRAINT "project_attachments_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_addons" ADD CONSTRAINT "service_addons_service_slug_services_slug_fk" FOREIGN KEY ("service_slug") REFERENCES "public"."services"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_inquiries" ADD CONSTRAINT "service_inquiries_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_inquiries" ADD CONSTRAINT "service_inquiries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_service_slug_services_slug_fk" FOREIGN KEY ("service_slug") REFERENCES "public"."services"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customers_normalized_email_idx" ON "customers" USING btree ("normalized_email");--> statement-breakpoint
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_user_id_unique_idx" ON "customers" USING btree ("user_id") WHERE "customers"."user_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "orders_customer_id_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_customer_email_idx" ON "orders" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_verified_by_admin_id_idx" ON "payments" USING btree ("verified_by_admin_id");--> statement-breakpoint
CREATE INDEX "payments_reversal_of_idx" ON "payments" USING btree ("reversal_of_payment_id");--> statement-breakpoint
CREATE INDEX "payments_idempotency_key_idx" ON "payments" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "attachments_order_id_idx" ON "project_attachments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "attachments_inquiry_id_idx" ON "project_attachments" USING btree ("inquiry_id");--> statement-breakpoint
CREATE INDEX "addons_service_slug_idx" ON "service_addons" USING btree ("service_slug");--> statement-breakpoint
CREATE INDEX "inquiries_customer_id_idx" ON "service_inquiries" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "inquiries_user_id_idx" ON "service_inquiries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "inquiries_status_idx" ON "service_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "packages_service_slug_idx" ON "service_packages" USING btree ("service_slug");--> statement-breakpoint
CREATE INDEX "services_category_idx" ON "services" USING btree ("category");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "analytics_path_idx" ON "visitor_analytics" USING btree ("path");--> statement-breakpoint
CREATE INDEX "analytics_timestamp_idx" ON "visitor_analytics" USING btree ("timestamp");