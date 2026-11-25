import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader, SiteFooter } from "../components/webcraftly/site-shell";
import { AuthProvider } from "../components/webcraftly/auth-context";
import { AuthModal } from "../components/webcraftly/auth-modal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 py-16 text-center">
      <div className="max-w-md">
        <span className="brand-pill mb-4">404 Error</span>
        <h1 className="text-4xl font-extrabold text-[#071C55]">Page Not Found</h1>
        <p className="mt-3 text-sm text-[#667085]">
          The page or service you are looking for has been moved or does not exist.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-[#0866D9] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/services"
            className="rounded-full border border-[#0866D9]/30 bg-[#EAF5FF] px-5 py-2.5 text-xs font-bold text-[#0866D9] hover:bg-blue-100 transition-colors"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 py-16 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-[#071C55]">Something Went Wrong</h1>
        <p className="mt-2 text-sm text-[#667085]">
          An unexpected error occurred while loading this view. You can reload or return to the marketplace.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-[#0866D9] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ProfessionalService", "Organization"],
      "@id": "https://webcraftly.vercel.app/#organization",
      name: "WebCraftly",
      legalName: "WebCraftly Digital Agency",
      url: "https://webcraftly.vercel.app",
      logo: "https://webcraftly.vercel.app/webcraftly-logo.jpg",
      image: "https://webcraftly.vercel.app/webcraftly-flyer.jpg",
      description:
        "WebCraftly is a premier digital agency and service e-commerce marketplace specializing in custom website development, e-commerce storefronts, UI/UX design, web applications, and SEO optimization with rapid turnaround.",
      slogan: "Code. Craft. Connect.",
      email: "webcraftly.official@gmail.com",
      telephone: "+91-96188-05557",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-96188-05557",
        contactType: "customer service",
        email: "webcraftly.official@gmail.com",
        availableLanguage: ["English", "Hindi", "Urdu", "Telugu"],
        contactOption: "WhatsApp Support",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        postalCode: "500001",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 17.385044,
        longitude: 78.486671,
      },
      priceRange: "₹₹",
      currenciesAccepted: "INR, USD, AED, GBP",
      paymentAccepted: "UPI, Bank Transfer, Net Banking",
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "AdministrativeArea", name: "Telangana" },
        { "@type": "City", name: "Hyderabad" },
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "United Arab Emirates" },
      ],
      sameAs: ["https://github.com/mohammedhajimohiuddin888-design/Webcraftly"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "WebCraftly Digital Services Catalog",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom Website Development",
              description: "Responsive high-performance websites for businesses, portfolios, and landing pages.",
              url: "https://webcraftly.vercel.app/services/website-development",
            },
            price: "3999",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "E-Commerce Storefront Development",
              description: "Full-featured online shops with product catalogs, shopping carts, and order workflows.",
              url: "https://webcraftly.vercel.app/services/ecommerce-development",
            },
            price: "8999",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "UI/UX & Product Design",
              description: "Figma design systems, wireframes, user testing, and conversion-optimized interfaces.",
              url: "https://webcraftly.vercel.app/services/ui-ux-design",
            },
            price: "2499",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom Web Applications",
              description: "Full-stack scalable web applications, SaaS dashboards, and portal solutions.",
              url: "https://webcraftly.vercel.app/services/web-applications",
            },
            price: "14999",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "SEO & Search Engine Optimization",
              description: "On-page SEO, technical audits, schema markup, and Google Search rankings.",
              url: "https://webcraftly.vercel.app/services/seo-optimization",
            },
            price: "2999",
            priceCurrency: "INR",
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://webcraftly.vercel.app/#website",
      url: "https://webcraftly.vercel.app",
      name: "WebCraftly",
      description: "Turn your ideas into powerful digital solutions with WebCraftly.",
      publisher: {
        "@id": "https://webcraftly.vercel.app/#organization",
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "FAQPage",
      "@id": "https://webcraftly.vercel.app/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What services does WebCraftly provide?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "WebCraftly specializes in custom website development, e-commerce stores, UI/UX design in Figma, full-stack web applications, AI automation, and search engine optimization (SEO).",
          },
        },
        {
          "@type": "Question",
          name: "How does ordering work on WebCraftly?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Browse our service catalog, select your package tier or add-ons, fill in your project brief in the checkout wizard, and submit your order. You receive an instant order tracking ID and immediate WhatsApp onboarding with our team at +91 96188 90557.",
          },
        },
        {
          "@type": "Question",
          name: "What are the starting prices and turnaround times?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Starter websites begin at ₹3,999 with typical 3-5 day delivery. Professional custom commercial tier websites begin at ₹24,999 with 10-day turnaround.",
          },
        },
        {
          "@type": "Question",
          name: "Where is WebCraftly located and which areas are served?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "WebCraftly is based in Hyderabad, Telangana, India, serving clients locally in Hyderabad and pan-India, as well as international businesses across the United States, UAE, UK, and worldwide.",
          },
        },
      ],
    },
  ],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WebCraftly | Premium Digital Agency & Service Marketplace" },
      {
        name: "description",
        content:
          "Turn your ideas into powerful websites and grow your online presence with WebCraftly. Browse, compare, customize, and order digital services with transparent pricing from ₹3,999.",
      },
      {
        name: "keywords",
        content:
          "web development agency Hyderabad, website designer India, custom ecommerce development, UI/UX design agency, web applications React Nextjs, SEO optimization services Hyderabad, digital agency Telangana, WebCraftly digital services",
      },
      { name: "author", content: "WebCraftly" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "theme-color", content: "#0866D9" },
      // Geographic / GEO SEO Metadata
      { name: "geo.region", content: "IN-TG" },
      { name: "geo.placename", content: "Hyderabad, Telangana, India" },
      { name: "geo.position", content: "17.385044;78.486671" },
      { name: "ICBM", content: "17.385044, 78.486671" },
      { name: "coverage", content: "Worldwide" },
      { name: "distribution", content: "Global" },
      { name: "target", content: "all" },
      // Open Graph (Facebook, WhatsApp, LinkedIn)
      { property: "og:site_name", content: "WebCraftly" },
      { property: "og:title", content: "WebCraftly | Digital Agency & Service Marketplace" },
      {
        property: "og:description",
        content:
          "Code. Craft. Connect. Premium website development, e-commerce, UI/UX, AI integration, and custom web applications.",
      },
      { property: "og:url", content: "https://webcraftly.vercel.app/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://webcraftly.vercel.app/webcraftly-flyer.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "WebCraftly - Code. Craft. Connect." },
      { property: "og:locale", content: "en_IN" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "WebCraftly | Digital Agency & Service Marketplace" },
      {
        name: "twitter:description",
        content:
          "Turn your ideas into high-converting websites and modern digital solutions. Transparent pricing from ₹3,999.",
      },
      { name: "twitter:image", content: "https://webcraftly.vercel.app/webcraftly-flyer.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://webcraftly.vercel.app/" },
      { rel: "alternate", hrefLang: "en-IN", href: "https://webcraftly.vercel.app/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://webcraftly.vercel.app/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-white text-[#15233D] antialiased selection:bg-[#EAF5FF] selection:text-[#0866D9]">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-white">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <AuthModal />
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
