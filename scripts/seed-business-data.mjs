/**
 * Milestone 3: Business Data Seeding Script
 *
 * Seeds:
 * - 8 core services
 * - 24 service packages (Basic, Professional, Premium for each service)
 * - Service add-ons
 * - 6 portfolio gallery themes
 *
 * Idempotency Guarantee:
 * Uses ON CONFLICT (...) DO UPDATE across all tables so running repeatedly produces
 * identical records without duplicates or errors.
 */

import postgresModule from "postgres";

try {
  process.loadEnvFile?.(".env.local");
} catch {}

const prodUrl = process.env.DATABASE_URL || process.env.LOVABLE_DB_MIGRATION_URL;
if (!prodUrl) {
  console.error("FATAL: DATABASE_URL is not set.");
  process.exit(1);
}

const postgres = postgresModule.default || postgresModule;
const sql = postgres(prodUrl, { ssl: "require", max: 2, prepare: false });

console.log("\n======================================================================");
console.log("MILESTONE 3: SEEDING CATALOG & BUSINESS DATA INTO NEONDB");
console.log("======================================================================\n");

async function seed() {
  const { services, portfolioItems } = await import("../src/lib/webcraftly.ts");

  console.log(`Loaded ${services.length} services and ${portfolioItems.length} portfolio items from src/lib/webcraftly.ts`);

  await sql.begin(async (tx) => {
    // 1. Seed Services
    console.log(`\n1. Seeding ${services.length} services...`);
    for (const s of services) {
      await tx`
        INSERT INTO "services" (
          slug, name, badge, icon_name, short_description, description,
          starting_price, featured, category, includes, benefits,
          technologies, process, created_at, updated_at
        ) VALUES (
          ${s.slug},
          ${s.name},
          ${s.badge || null},
          ${s.iconName},
          ${s.short},
          ${s.description},
          ${s.startingPrice},
          ${Boolean(s.featured)},
          ${s.category},
          ${sql.json(s.includes || [])},
          ${sql.json(s.benefits || [])},
          ${sql.json(s.technologies || [])},
          ${sql.json(s.process || [])},
          now(),
          now()
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          badge = EXCLUDED.badge,
          icon_name = EXCLUDED.icon_name,
          short_description = EXCLUDED.short_description,
          description = EXCLUDED.description,
          starting_price = EXCLUDED.starting_price,
          featured = EXCLUDED.featured,
          category = EXCLUDED.category,
          includes = EXCLUDED.includes,
          benefits = EXCLUDED.benefits,
          technologies = EXCLUDED.technologies,
          process = EXCLUDED.process,
          updated_at = now();
      `;
      console.log(`   [✓] Service seeded: ${s.name} (${s.slug})`);
    }

    // 2. Seed Packages (8 services * 3 tiers = 24 packages)
    console.log(`\n2. Seeding service packages (3 per service)...`);
    let packageCount = 0;
    const tiers = ["Basic", "Professional", "Premium"];

    for (const s of services) {
      for (const tier of tiers) {
        const pkg = s.packages[tier];
        if (!pkg) continue;

        const packageId = `${s.slug}-${tier.toLowerCase()}`;
        await tx`
          INSERT INTO "service_packages" (
            id, service_slug, tier, name, tagline, price, original_price,
            delivery_days, revisions, popular, features, deliverables,
            comparison_attributes, created_at, updated_at
          ) VALUES (
            ${packageId},
            ${s.slug},
            ${pkg.tier},
            ${pkg.name},
            ${pkg.tagline || null},
            ${pkg.price},
            ${pkg.originalPrice || null},
            ${pkg.deliveryDays},
            ${String(pkg.revisions)},
            ${Boolean(pkg.popular)},
            ${sql.json(pkg.features || [])},
            ${sql.json(pkg.deliverables || [])},
            ${sql.json({})},
            now(),
            now()
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            tagline = EXCLUDED.tagline,
            price = EXCLUDED.price,
            original_price = EXCLUDED.original_price,
            delivery_days = EXCLUDED.delivery_days,
            revisions = EXCLUDED.revisions,
            popular = EXCLUDED.popular,
            features = EXCLUDED.features,
            deliverables = EXCLUDED.deliverables,
            updated_at = now();
        `;
        packageCount++;
      }
    }
    console.log(`   [✓] Seeded ${packageCount} service packages.`);

    // 3. Seed Add-ons
    console.log(`\n3. Seeding service add-ons...`);
    let addonCount = 0;
    for (const s of services) {
      if (!s.addOns || s.addOns.length === 0) continue;
      for (const a of s.addOns) {
        const addonId = `${s.slug}-${a.id}`;
        await tx`
          INSERT INTO "service_addons" (
            id, service_slug, name, description, price, created_at, updated_at
          ) VALUES (
            ${addonId},
            ${s.slug},
            ${a.name},
            ${a.description},
            ${a.price},
            now(),
            now()
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            updated_at = now();
        `;
        addonCount++;
      }
    }
    console.log(`   [✓] Seeded ${addonCount} service add-ons.`);

    // 4. Seed Gallery Themes (Portfolio)
    console.log(`\n4. Seeding ${portfolioItems.length} portfolio gallery themes...`);
    for (const item of portfolioItems) {
      await tx`
        INSERT INTO "gallery_themes" (
          id, title, category, type, description, technologies,
          metrics, client, preview_url, image_url, featured,
          created_at, updated_at
        ) VALUES (
          ${item.id},
          ${item.title},
          ${item.category},
          ${item.type},
          ${item.description},
          ${sql.json(item.technologies || [])},
          ${item.metrics || null},
          ${item.client || null},
          ${item.previewUrl || null},
          ${item.imageUrl},
          true,
          now(),
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          type = EXCLUDED.type,
          description = EXCLUDED.description,
          technologies = EXCLUDED.technologies,
          metrics = EXCLUDED.metrics,
          client = EXCLUDED.client,
          preview_url = EXCLUDED.preview_url,
          image_url = EXCLUDED.image_url,
          updated_at = now();
      `;
      console.log(`   [✓] Theme seeded: ${item.title} (${item.id})`);
    }
  });

  // Verification queries
  console.log("\n======================================================================");
  console.log("SEEDING VERIFICATION (Row Counts in Production neondb)");
  console.log("======================================================================");

  const [servicesCount] = await sql`SELECT count(*)::int as count FROM "services"`;
  const [packagesCount] = await sql`SELECT count(*)::int as count FROM "service_packages"`;
  const [addonsCount] = await sql`SELECT count(*)::int as count FROM "service_addons"`;
  const [themesCount] = await sql`SELECT count(*)::int as count FROM "gallery_themes"`;

  console.log(`services:          ${servicesCount.count} (Expected: 8)`);
  console.log(`service_packages:  ${packagesCount.count} (Expected: 24)`);
  console.log(`service_addons:    ${addonsCount.count} (Expected: > 0)`);
  console.log(`gallery_themes:    ${themesCount.count} (Expected: 6)`);

  if (servicesCount.count !== 8 || packagesCount.count !== 24 || themesCount.count !== 6) {
    throw new Error("Row count mismatch after seeding!");
  }

  console.log("\n[PASS] All catalog seed counts verified successfully!");
}

try {
  await seed();
} catch (e) {
  console.error("Seeding error:", e);
  process.exit(1);
} finally {
  await sql.end({ timeout: 3 });
}
