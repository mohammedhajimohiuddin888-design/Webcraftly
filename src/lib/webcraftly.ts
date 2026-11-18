export type PackageTier = "Basic" | "Professional" | "Premium";

export type ServicePackage = {
  tier: PackageTier;
  name: string;
  tagline: string;
  price: number; // in INR
  originalPrice?: number;
  deliveryDays: number;
  revisions: number | "Unlimited";
  popular?: boolean;
  features: string[];
  deliverables: string[];
};

export type ServiceAddon = {
  id: string;
  name: string;
  description: string;
  price: number; // in INR
};

export type ComparisonRow = {
  feature: string;
  basic: string | boolean;
  professional: string | boolean;
  premium: string | boolean;
};

export type Service = {
  slug: string;
  name: string;
  badge: string;
  iconName: string;
  short: string;
  description: string;
  startingPrice: number;
  featured?: boolean;
  category: "Development" | "Design" | "Marketing" | "AI & Systems";
  includes: string[];
  benefits: string[];
  technologies: string[];
  process: { step: string; title: string; description: string }[];
  packages: Record<PackageTier, ServicePackage>;
  addOns: ServiceAddon[];
  comparisonTable: ComparisonRow[];
};

export const services: Service[] = [
  {
    slug: "website-development",
    name: "Website Development",
    badge: "Most Popular",
    iconName: "Code2",
    short: "High-performance, beautifully designed business websites that build instant credibility and convert visitors into customers.",
    description: "From sleek startup landing pages to robust corporate websites, we engineer responsive, search-optimized web platforms tailored to your business goals. Fast loading speeds, seamless mobile UX, and modern architecture come standard.",
    startingPrice: 9999,
    featured: true,
    category: "Development",
    includes: [
      "Custom Business Websites",
      "High-Converting Landing Pages",
      "Portfolio & Personal Brands",
      "Corporate Enterprise Portals",
      "Responsive Cross-Device Layouts",
      "Speed & Performance Optimization"
    ],
    benefits: [
      "Engineered for sub-second page loads and maximum search discoverability",
      "Bespoke UI design that mirrors your unique brand identity and builds trust",
      "100% mobile-first responsive layout tested across iOS and Android screens",
      "Clean semantic code ready to scale with your business"
    ],
    technologies: ["React / Vite", "Next.js / SSR", "Tailwind CSS", "TypeScript", "Node.js", "Vercel / Cloudflare"],
    process: [
      { step: "01", title: "Discovery & Blueprint", description: "We analyze your business, target audience, and key conversion goals to outline the site structure and wireframes." },
      { step: "02", title: "Bespoke Design", description: "Our UI designers craft a custom look and feel aligned with your brand guidelines and user journey." },
      { step: "03", title: "Clean Development", description: "We write clean, semantic code with fast loading speeds, responsive layouts, and interactive components." },
      { step: "04", title: "QA & Deployment", description: "Rigorous cross-browser testing, SEO checklist verification, and smooth launch to your domain." }
    ],
    packages: {
      Basic: {
        tier: "Basic",
        name: "Starter Business",
        tagline: "Ideal for small businesses & professionals establishing their web presence",
        price: 9999,
        originalPrice: 14999,
        deliveryDays: 5,
        revisions: 3,
        features: [
          "Up to 4 custom responsive pages",
          "Mobile & tablet optimized",
          "Contact form with email alerts",
          "Social media integration",
          "Basic Google Search indexing",
          "Speed optimization (under 2s)"
        ],
        deliverables: ["Full source code", "Hosting deployment", "14 days post-launch support"]
      },
      Professional: {
        tier: "Professional",
        name: "Growth Commercial",
        tagline: "Our most chosen plan for growing businesses seeking strong online conversions",
        price: 24999,
        originalPrice: 34999,
        deliveryDays: 10,
        revisions: 6,
        popular: true,
        features: [
          "Up to 10 custom designed pages",
          "Direct WhatsApp chat integration",
          "Dynamic blog / CMS setup",
          "Advanced multi-step lead forms",
          "On-page SEO optimization & metadata",
          "Interactive animations & testimonials",
          "Google Analytics 4 setup"
        ],
        deliverables: ["Full source code", "CMS training session", "30 days post-launch support", "Admin documentation"]
      },
      Premium: {
        tier: "Premium",
        name: "Enterprise Brand",
        tagline: "Tailored for businesses needing comprehensive custom web solutions",
        price: 49999,
        originalPrice: 69999,
        deliveryDays: 16,
        revisions: "Unlimited",
        features: [
          "Up to 20+ custom pages & landing pages",
          "Custom design system & UI animations",
          "Full CMS & dynamic content management",
          "Payment gateway & CRM integration",
          "Comprehensive Technical & On-Page SEO",
          "Priority 99+ Core Web Vitals score",
          "Multi-language or multi-location ready"
        ],
        deliverables: ["Full codebase repository", "Priority 24/7 dedicated lead engineer", "60 days VIP post-launch support", "Speed performance guarantee"]
      }
    },
    addOns: [
      { id: "wd-extra-page", name: "Additional Custom Page", description: "Designed, written, and coded to match the site design.", price: 1999 },
      { id: "wd-blog-cms", name: "Full Blog / News CMS", description: "Easily publish articles, manage categories, and boost organic traffic.", price: 4999 },
      { id: "wd-whatsapp-widget", name: "Direct WhatsApp & Call Widget", description: "Floating branded contact button connecting straight to your team.", price: 1299 },
      { id: "wd-express-turnaround", name: "Express 72-Hour Delivery", description: "Dedicated fast-track development sprint for urgent launches.", price: 4999 },
      { id: "wd-annual-maintenance", name: "1-Year Maintenance & Security", description: "Monthly backups, uptime monitoring, security updates, and content changes.", price: 9999 }
    ],
    comparisonTable: [
      { feature: "Starting Price", basic: "₹9,999", professional: "₹24,999", premium: "₹49,999" },
      { feature: "Number of Pages", basic: "Up to 4 Pages", professional: "Up to 10 Pages", premium: "Up to 25 Pages" },
      { feature: "Responsive Mobile UI", basic: true, professional: true, premium: true },
      { feature: "Custom UI Design", basic: "Clean Template Customization", professional: "100% Bespoke Design", premium: "Bespoke Design System" },
      { feature: "Lead Capture & Forms", basic: "Standard Contact Form", professional: "Advanced Multi-step Forms", premium: "CRM Integrated Forms" },
      { feature: "WhatsApp Quick Connect", basic: false, professional: true, premium: true },
      { feature: "Blog / News CMS", basic: false, professional: true, premium: true },
      { feature: "SEO Foundations", basic: "Basic Meta Tags", professional: "Complete On-Page SEO", premium: "Full Technical & Schema SEO" },
      { feature: "Delivery Timeline", basic: "5 Days", professional: "10 Days", premium: "16 Days" },
      { feature: "Revisions Allowed", basic: "3 Rounds", professional: "6 Rounds", premium: "Unlimited Rounds" },
      { feature: "Support Period", basic: "14 Days", professional: "30 Days", premium: "60 Days Dedicated" }
    ]
  },
  {
    slug: "content-development",
    name: "Content Development",
    badge: "High Conversion",
    iconName: "FileText",
    short: "Compelling, SEO-rich brand storytelling and web copy that articulates your value proposition clearly and drives action.",
    description: "Words that resonate, educate, and sell. We write persuasive website copy, high-ranking SEO blog articles, and authoritative business communications that establish your company as a leader in your industry.",
    startingPrice: 3999,
    category: "Marketing",
    includes: [
      "Website Copywriting & Value Propositions",
      "SEO-Optimized Blog Articles",
      "Product & Service Descriptions",
      "Brand Story & About Page Narrative",
      "Call-to-Action & Microcopy Optimization",
      "Competitor Keyword Research"
    ],
    benefits: [
      "Clarity that turns confused browsers into decisive buyers",
      "Keywords woven naturally without awkward keyword-stuffing",
      "Consistent tone of voice tailored to your target demographic",
      "Ready to paste directly into your CMS or design prototypes"
    ],
    technologies: ["Surfer SEO", "Ahrefs & SEMrush", "Grammarly Business", "Hemingway Editor", "Content Architecture"],
    process: [
      { step: "01", title: "Brand Voice Alignment", description: "We interview you to understand your mission, value proposition, and customer pain points." },
      { step: "02", title: "Keyword & Intent Mapping", description: "We identify high-intent search terms your prospective clients are actively looking for." },
      { step: "03", title: "Drafting & Polishing", description: "Our senior copywriters craft punchy, persuasive drafts structured for skimmability." },
      { step: "04", title: "Refinements & Sign-off", description: "We fine-tune based on your feedback and deliver ready-to-publish copy decks." }
    ],
    packages: {
      Basic: {
        tier: "Basic",
        name: "Essential Web Copy",
        tagline: "Clear copy for home, about, and services pages",
        price: 3999,
        originalPrice: 5999,
        deliveryDays: 3,
        revisions: 2,
        features: [
          "Up to 3 core website pages (approx 1,500 words)",
          "Audience persona targeting",
          "Keyword integration for SEO",
          "Punchy headlines & call to action buttons",
          "Proofreading & readability check"
        ],
        deliverables: ["Google Docs / Word copy deck", "Meta descriptions & titles", "2 revision cycles"]
      },
      Professional: {
        tier: "Professional",
        name: "Growth Content Suite",
        tagline: "Comprehensive website copy plus targeted authority blog posts",
        price: 8999,
        originalPrice: 12999,
        deliveryDays: 5,
        revisions: 4,
        popular: true,
        features: [
          "Up to 7 complete pages (approx 4,000 words)",
          "2 in-depth SEO blog articles (1,200 words each)",
          "Competitor messaging analysis",
          "Structured H1, H2, and FAQ schema copy",
          "Persuasive social proof & testimonial framing"
        ],
        deliverables: ["Comprehensive copy document", "Keyword research matrix", "Image suggestions", "30 days review period"]
      },
      Premium: {
        tier: "Premium",
        name: "Authority Brand Deck",
        tagline: "Complete brand narrative, multi-page website copy, and thought-leadership series",
        price: 16999,
        originalPrice: 22999,
        deliveryDays: 9,
        revisions: "Unlimited",
        features: [
          "Full website copy up to 15 pages",
          "Brand Voice & Messaging Guidelines document",
          "4 high-ranking SEO pillar articles",
          "Email welcome series sequence (3 emails)",
          "Lead magnet / whitepaper writeup"
        ],
        deliverables: ["Full Brand Voice Manual", "Ready-to-deploy CMS copy", "Priority turnaround", "Direct consultation call"]
      }
    },
    addOns: [
      { id: "cd-extra-blog", name: "Extra SEO Blog Post (1,500 words)", description: "Researched, keyword-optimized article ready to publish.", price: 1499 },
      { id: "cd-product-pack", name: "10 Product Descriptions Pack", description: "Compelling feature-benefit descriptions engineered to sell.", price: 2499 },
      { id: "cd-brand-deck", name: "Brand Slogan & Tagline Deck", description: "5 curated tagline concepts with rationale and trademark review.", price: 1999 },
      { id: "cd-case-study", name: "In-Depth Client Case Study", description: "Problem, solution, and outcome interview write-up.", price: 2999 }
    ],
    comparisonTable: [
      { feature: "Price", basic: "₹3,999", professional: "₹8,999", premium: "₹16,999" },
      { feature: "Total Word Count", basic: "~1,500 words", professional: "~4,000 words + 2 blogs", premium: "Full Site + 4 blogs (~10,000 words)" },
      { feature: "Pages Covered", basic: "3 Core Pages", professional: "Up to 7 Pages", premium: "Up to 15 Pages" },
      { feature: "SEO Keyword Research", basic: "Primary Keywords", professional: "In-depth Intent Mapping", premium: "Full Competitor Gap Strategy" },
      { feature: "Brand Voice Guidelines", basic: false, professional: false, premium: true },
      { feature: "Email Sequence Included", basic: false, professional: false, premium: "3-Part Onboarding Series" },
      { feature: "Delivery Time", basic: "3 Days", professional: "5 Days", premium: "9 Days" },
      { feature: "Revisions", basic: "2 Rounds", professional: "4 Rounds", premium: "Unlimited" }
    ]
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    badge: "Award-Grade",
    iconName: "PenTool",
    short: "Intuitive, high-converting interfaces and clickable prototypes crafted in Figma with pixel-perfect attention to detail.",
    description: "Design is not just how it looks—it's how it works. We design intuitive user interfaces and seamless user flows that reduce friction, boost retention, and make your digital product feel unmistakably premium.",
    startingPrice: 7499,
    featured: true,
    category: "Design",
    includes: [
      "Custom Web UI & App Design",
      "Interactive Clickable Figma Prototypes",
      "Low & High-Fidelity Wireframes",
      "Design Systems & Component Libraries",
      "User Journey & Information Architecture",
      "Developer-Ready Asset Handoff"
    ],
    benefits: [
      "Validate product concepts before writing a single line of backend code",
      "Consistent typography, spacing, and micro-interactions that elevate brand trust",
      "Thoroughly tested flows that eliminate user drop-off during onboarding and checkout",
      "Direct Figma file link with organized auto-layout and design tokens"
    ],
    technologies: ["Figma", "Auto Layout 5.0", "Framer", "Design Tokens", "Tailwind Design System", "Phosphor & Lucide"],
    process: [
      { step: "01", title: "User Flow Mapping", description: "Mapping out exact screen states, decision points, and user goals." },
      { step: "02", title: "Low-Fidelity Wireframes", description: "Rapid wireframes to test layout, hierarchy, and information density." },
      { step: "03", title: "High-Fidelity Visual Design", description: "Applying colors, typography, imagery, and polish to create stunning screens." },
      { step: "04", title: "Prototyping & Handoff", description: "Connecting screens into an interactive prototype and preparing dev specs." }
    ],
    packages: {
      Basic: {
        tier: "Basic",
        name: "Concept & Wireframes",
        tagline: "Perfect for testing an MVP idea or redesigning core pages",
        price: 7499,
        originalPrice: 10999,
        deliveryDays: 4,
        revisions: 2,
        features: [
          "Up to 4 custom high-fidelity screens",
          "Desktop or mobile viewport",
          "Figma source file with auto-layout",
          "Color palette and typography spec",
          "Free Google fonts and icon integration"
        ],
        deliverables: ["Figma file link", "PNG/SVG exports", "2 revision cycles"]
      },
      Professional: {
        tier: "Professional",
        name: "Complete Product UI/UX",
        tagline: "End-to-end design for websites or web apps with clickable prototype",
        price: 18499,
        originalPrice: 25999,
        deliveryDays: 8,
        revisions: 5,
        popular: true,
        features: [
          "Up to 10 comprehensive screens",
          "Both Desktop and Mobile viewports",
          "Interactive clickable prototype in Figma",
          "Reusable component library (Buttons, Modals, Inputs)",
          "Micro-interactions & hover state designs",
          "Developer handoff documentation"
        ],
        deliverables: ["Full Figma Workspace", "Component System", "Prototype share link", "Dev redlines"]
      },
      Premium: {
        tier: "Premium",
        name: "Enterprise Design System",
        tagline: "Full-scale multi-platform product architecture and design token system",
        price: 38999,
        originalPrice: 52999,
        deliveryDays: 14,
        revisions: "Unlimited",
        features: [
          "Up to 25+ comprehensive responsive screens",
          "Full Design System with dark and light modes",
          "Complex user flows (Auth, Dashboard, Checkout, Settings)",
          "Advanced interactive micro-animations",
          "Usability review and UX audit report",
          "1-on-1 developer alignment workshop"
        ],
        deliverables: ["Complete Master Figma file", "Figma Variables & Tokens", "Unlimited revisions", "Direct Slack / WhatsApp support"]
      }
    },
    addOns: [
      { id: "ui-clickable-proto", name: "Interactive Clickable Prototype", description: "Realistic clickable prototype with transitions and modal states.", price: 3999 },
      { id: "ui-mobile-views", name: "Companion Mobile App Screens", description: "Mobile-specific adaptations of your desktop web screens.", price: 5999 },
      { id: "ui-custom-icons", name: "Bespoke Icon & Illustration Set", description: "20 custom branded vector icons aligned with your brand style.", price: 3499 },
      { id: "ui-ux-audit", name: "Heuristic UX Audit & Heatmap Review", description: "Video walkthrough highlighting drop-off points on your existing site.", price: 4999 }
    ],
    comparisonTable: [
      { feature: "Price", basic: "₹7,499", professional: "₹18,499", premium: "₹38,999" },
      { feature: "Screen Count", basic: "Up to 4 Screens", professional: "Up to 10 Screens", premium: "Up to 25+ Screens" },
      { feature: "Viewports Included", basic: "Desktop Only", professional: "Desktop + Mobile", premium: "Desktop, Tablet & Mobile" },
      { feature: "Clickable Prototype", basic: false, professional: true, premium: true },
      { feature: "Component Library", basic: "Basic Styles", professional: "Reusable Components", premium: "Full Design System & Tokens" },
      { feature: "Dark Mode Variations", basic: false, professional: false, premium: true },
      { feature: "Delivery Time", basic: "4 Days", professional: "8 Days", premium: "14 Days" },
      { feature: "Revisions", basic: "2 Rounds", professional: "5 Rounds", premium: "Unlimited" }
    ]
  },
  {
    slug: "ecommerce-development",
    name: "E-commerce Solutions",
    badge: "Revenue Engine",
    iconName: "ShoppingCart",
    short: "Fast, secure online stores with frictionless checkout, inventory tracking, and seamless Indian payment gateways like Razorpay.",
    description: "Build an online storefront engineered to sell. From boutique direct-to-consumer shops to high-volume multi-category marketplaces, we integrate robust inventory management, dynamic carts, automated invoices, and secure payment processing.",
    startingPrice: 18999,
    featured: true,
    category: "Development",
    includes: [
      "Custom Online Store Development",
      "Product Catalog & Variant Management",
      "Shopping Cart & Multi-Step Checkout",
      "Razorpay, Stripe & UPI Payment Gateways",
      "Customer Account Portals & Order History",
      "Automated WhatsApp & Email Notifications"
    ],
    benefits: [
      "Zero transaction commission on our side—keep 100% of your retail margins",
      "Blazing fast catalog browsing that keeps shoppers browsing without lag",
      "Integrated Indian payment options: UPI, Credit/Debit cards, Netbanking, and COD",
      "Intuitive admin dashboard to add products, adjust stock, and fulfill orders"
    ],
    technologies: ["React / Vite", "Supabase / PostgreSQL", "Razorpay SDK", "Tailwind CSS", "Stripe API", "Shiprocket Webhooks"],
    process: [
      { step: "01", title: "Catalog Architecture", description: "Organizing categories, attributes, SKU structures, and pricing models." },
      { step: "02", title: "Storefront & Cart Design", description: "Crafting a frictionless customer shopping experience from home to checkout." },
      { step: "03", title: "Gateway & Logistics Sync", description: "Integrating secure payment providers, tax rules, and courier webhooks." },
      { step: "04", title: "Security Audit & Launch", description: "Simulating end-to-end orders, verifying invoice triggers, and going live." }
    ],
    packages: {
      Basic: {
        tier: "Basic",
        name: "Shop Starter",
        tagline: "Launch your boutique store with essential products and secure payments",
        price: 18999,
        originalPrice: 24999,
        deliveryDays: 7,
        revisions: 3,
        features: [
          "Up to 25 products added & configured",
          "Shopping cart & streamlined single-page checkout",
          "Razorpay & UPI payment integration",
          "Customer order confirmation emails",
          "Mobile responsive storefront",
          "Basic coupon code discounts"
        ],
        deliverables: ["Live online store", "Admin product management training", "21 days support"]
      },
      Professional: {
        tier: "Professional",
        name: "Growth Storefront",
        tagline: "Engineered for scaling retail brands with automated workflows",
        price: 39999,
        originalPrice: 54999,
        deliveryDays: 14,
        revisions: 6,
        popular: true,
        features: [
          "Up to 150 products with size/color variants",
          "Razorpay, Cashfree & Cash on Delivery options",
          "Automated WhatsApp order notifications",
          "Abandoned cart recovery prompts",
          "Customer accounts & order tracking dashboard",
          "Advanced faceted search & filter system",
          "Inventory stock-level warnings"
        ],
        deliverables: ["Full E-commerce platform", "Staff training video", "45 days post-launch support", "Logistics setup guide"]
      },
      Premium: {
        tier: "Premium",
        name: "Marketplace / Custom Retail",
        tagline: "Enterprise-grade e-commerce with advanced integrations and high concurrency",
        price: 79999,
        originalPrice: 109999,
        deliveryDays: 22,
        revisions: "Unlimited",
        features: [
          "Unlimited product listings & bulk CSV imports",
          "Multi-currency & international shipping setup",
          "Shiprocket / Delhivery courier API integration",
          "Custom loyalty points & referral rewards program",
          "Custom B2B wholesale pricing tiers",
          "Dedicated high-speed database caching",
          "Priority SLA support & monthly security audits"
        ],
        deliverables: ["Scalable e-commerce infrastructure", "Custom ERP/CRM integrations", "90 days VIP support", "Dedicated developer"]
      }
    },
    addOns: [
      { id: "ec-100-products", name: "100 Additional Products Import", description: "Bulk preparation, categorization, and image optimization.", price: 4999 },
      { id: "ec-razorpay-suite", name: "Razorpay Indian Payment Suite", description: "Configured with UPI Intent, QR code, EMI, and Netbanking.", price: 2999 },
      { id: "ec-whatsapp-orders", name: "Automated WhatsApp Alerts", description: "Instant WhatsApp updates on order dispatch, tracking, and delivery.", price: 3499 },
      { id: "ec-shiprocket-sync", name: "Shiprocket Logistics Automated Sync", description: "One-click label printing and live tracking updates for clients.", price: 5999 }
    ],
    comparisonTable: [
      { feature: "Price", basic: "₹18,999", professional: "₹39,999", premium: "₹79,999" },
      { feature: "Product Capacity", basic: "Up to 25 Products", professional: "Up to 150 Products", premium: "Unlimited Products" },
      { feature: "Payment Gateways", basic: "Razorpay & UPI", professional: "Razorpay + Cashfree + COD", premium: "Multi-Gateway + International" },
      { feature: "Customer Accounts", basic: "Guest Checkout", professional: "Full Account & History", premium: "VIP Tiering & Loyalty" },
      { feature: "WhatsApp Order Alerts", basic: false, professional: true, premium: true },
      { feature: "Logistics API Integration", basic: false, professional: "Standard Webhooks", premium: "Live Courier Auto-Sync" },
      { feature: "Discount / Coupon Engine", basic: "Simple Fixed Codes", professional: "Advanced Rules & Promos", premium: "Personalized Customer Codes" },
      { feature: "Delivery Timeline", basic: "7 Days", professional: "14 Days", premium: "22 Days" },
      { feature: "Support Period", basic: "21 Days", professional: "45 Days", premium: "90 Days" }
    ]
  },
  {
    slug: "ai-integration",
    name: "AI Integration",
    badge: "Smart Tech",
    iconName: "Bot",
    short: "Custom AI assistants, intelligent chatbots, and workflow automation connected seamlessly to your company's proprietary data.",
    description: "Harness modern artificial intelligence to deliver instant customer service, qualify leads 24/7, and automate repetitive business operations. We build tailored AI solutions using Gemini, OpenAI, and custom vector databases that understand your business.",
    startingPrice: 14999,
    category: "AI & Systems",
    includes: [
      "Custom Knowledge-Base AI Chatbots",
      "24/7 Website Lead Qualification Assistants",
      "Automated Business Workflow Triggers",
      "Gemini & OpenAI API Integration",
      "Document & PDF Knowledge Embedding",
      "Admin Conversation Logs & Analytics"
    ],
    benefits: [
      "Answer customer queries in milliseconds using your official service guidelines",
      "Capture qualified leads and push them straight to your phone or CRM",
      "Drastically reduce support burden while maintaining human-like empathy",
      "Private and secure data handling—your data is never used for public training"
    ],
    technologies: ["Google Gemini API", "OpenAI / Claude", "LangChain", "Vector DB / pgvector", "Webhooks", "Node.js"],
    process: [
      { step: "01", title: "Knowledge Extraction", description: "We gather your FAQs, service pricing, policies, and product details into a clean corpus." },
      { step: "02", title: "Prompt Engineering & Guardrails", description: "Designing system prompts and guardrails to ensure truthful, brand-aligned answers." },
      { step: "03", title: "Vector Embeddings & Sync", description: "Connecting dynamic search retrieval so the AI pulls real-time facts from your data." },
      { step: "04", title: "Widget Deployment & Telemetry", description: "Embedding the chat widget onto your site and setting up email/WhatsApp lead alerts." }
    ],
    packages: {
      Basic: {
        tier: "Basic",
        name: "Smart Support Bot",
        tagline: "Embed an intelligent FAQ bot trained on your business documents",
        price: 14999,
        originalPrice: 19999,
        deliveryDays: 5,
        revisions: 2,
        features: [
          "Custom chatbot trained on your company website and docs",
          "Website chat bubble matching your brand colors",
          "Answers FAQs, business hours, and service options",
          "Lead capture (Name, Email, Phone collection)",
          "Email alert sent on new lead capture",
          "Up to 2,000 monthly inquiries handled"
        ],
        deliverables: ["Installed chatbot widget", "Admin knowledge editor", "14 days tuning support"]
      },
      Professional: {
        tier: "Professional",
        name: "Intelligent Sales Copilot",
        tagline: "Active lead qualification, calendar booking, and CRM integration",
        price: 34999,
        originalPrice: 47999,
        deliveryDays: 10,
        revisions: 4,
        popular: true,
        features: [
          "Multi-document knowledge base (PDFs, pricing tables, manuals)",
          "Autonomous meeting scheduling (Google Calendar / Calendly)",
          "WhatsApp bot & website widget synchronization",
          "Lead scoring & CRM webhook forwarding",
          "Fallback to human agent notification",
          "Admin telemetry dashboard (view user questions & satisfaction)"
        ],
        deliverables: ["Multi-channel bot system", "Webhook integrations", "Admin dashboard", "30 days prompt refinement"]
      },
      Premium: {
        tier: "Premium",
        name: "Enterprise Autonomous Agent",
        tagline: "Custom autonomous agent connected to internal APIs and databases",
        price: 69999,
        originalPrice: 94999,
        deliveryDays: 18,
        revisions: "Unlimited",
        features: [
          "Custom API function calling (e.g., check live order status, calculate custom quote)",
          "Vector database retrieval (pgvector) for millions of records",
          "Multi-lingual support (Hindi, Telugu, Tamil, English, etc.)",
          "Enterprise authentication & role-based bot responses",
          "Strict anti-hallucination guardrails and fallback workflows",
          "Quarterly model fine-tuning and maintenance"
        ],
        deliverables: ["Full AI pipeline source", "Vector DB architecture", "API connectors", "60 days VIP engineering support"]
      }
    },
    addOns: [
      { id: "ai-whatsapp-bridge", name: "WhatsApp Business API Bridge", description: "Let customers chat with your AI assistant directly on WhatsApp.", price: 8999 },
      { id: "ai-knowledge-embed", name: "Expanded Knowledge Base (50 Docs)", description: "Vectorization and indexing of comprehensive product manuals.", price: 6999 },
      { id: "ai-analytics-panel", name: "Custom AI Conversation Analytics", description: "Detailed sentiment analysis, missing FAQ reports, and trend charts.", price: 4499 },
      { id: "ai-crm-webhook", name: "Instant CRM Lead Router", description: "Automatically create deals in HubSpot, Zoho, or Google Sheets.", price: 5499 }
    ],
    comparisonTable: [
      { feature: "Price", basic: "₹14,999", professional: "₹34,999", premium: "₹69,999" },
      { feature: "Knowledge Base Size", basic: "Up to 5 Pages / Docs", professional: "Up to 30 Documents", premium: "Unlimited / Vector DB" },
      { feature: "Channels Supported", basic: "Website Widget Only", professional: "Website + WhatsApp", premium: "Omnichannel (Web, WA, Email)" },
      { feature: "Lead Capture & Booking", basic: "Basic Form Capture", professional: "Auto Calendar Booking", premium: "Full CRM Synchronization" },
      { feature: "API Function Calling", basic: false, professional: "Standard Webhooks", premium: "Dynamic DB Queries & Action APIs" },
      { feature: "Multi-Language Support", basic: "English Only", professional: "English + 2 Languages", premium: "All Major Indian & Global Languages" },
      { feature: "Delivery Timeline", basic: "5 Days", professional: "10 Days", premium: "18 Days" },
      { feature: "Post-Launch Tuning", basic: "14 Days", professional: "30 Days", premium: "60 Days" }
    ]
  },
  {
    slug: "seo-optimization",
    name: "SEO Optimization",
    badge: "Sustainable Growth",
    iconName: "Search",
    short: "Dominate search engine rankings with data-driven on-page optimization, technical speed fixes, and targeted local search dominance.",
    description: "Get discovered by clients actively searching for your services. We eliminate technical crawling roadblocks, optimize site structure, research high-intent buyer keywords, and implement schema markup that drives organic traffic to your business.",
    startingPrice: 5999,
    category: "Marketing",
    includes: [
      "Technical SEO & Core Web Vitals Audits",
      "High-Intent Commercial Keyword Research",
      "On-Page Meta Tags, H1-H6 & Content Optimization",
      "Google Search Console & Bing Webmaster Setup",
      "Rich Snippet Schema Markup Integration",
      "Google Business Profile / Local Maps Optimization"
    ],
    benefits: [
      "Stop paying for every single click—build an enduring organic traffic asset",
      "Rank for local queries like 'services near me' in your city or region",
      "Resolve indexing bugs and crawl errors that keep your pages invisible",
      "Clear monthly reporting with transparent keyword tracking metrics"
    ],
    technologies: ["Google Search Console", "Ahrefs", "Screaming Frog", "Schema.org", "PageSpeed Insights", "Lighthouse"],
    process: [
      { step: "01", title: "Deep Site Audit", description: "Scanning 50+ technical checkpoints including page speed, broken links, and crawl traps." },
      { step: "02", title: "Keyword Opportunity Analysis", description: "Finding low-competition, high-conversion search terms your competitors overlooked." },
      { step: "03", title: "On-Page Execution", description: "Optimizing page titles, descriptions, image alt tags, internal links, and headings." },
      { step: "04", title: "Indexing & Monitoring", description: "Submitting XML sitemaps to Google and monitoring rank movements." }
    ],
    packages: {
      Basic: {
        tier: "Basic",
        name: "SEO Foundations",
        tagline: "Essential technical health check and core page setup",
        price: 5999,
        originalPrice: 8999,
        deliveryDays: 4,
        revisions: 2,
        features: [
          "Full 40-point technical site audit",
          "5 core pages on-page SEO optimization",
          "XML sitemap & robots.txt creation",
          "Google Search Console verification",
          "Basic organization schema markup",
          "Broken link and 404 error cleanup"
        ],
        deliverables: ["Audit PDF report", "Implemented code fixes", "GSC access verification"]
      },
      Professional: {
        tier: "Professional",
        name: "Growth Search Booster",
        tagline: "Target high-intent keywords and boost ranking velocity",
        price: 14999,
        originalPrice: 21999,
        deliveryDays: 10,
        revisions: 4,
        popular: true,
        features: [
          "Comprehensive audit + 15 pages optimization",
          "30 targeted high-intent commercial keywords",
          "Google Business Profile (Google Maps) optimization",
          "Core Web Vitals speed optimization suggestions",
          "FAQ & Local Business JSON-LD schema",
          "Competitor backlink & keyword gap analysis",
          "Monthly ranking progress report"
        ],
        deliverables: ["Keyword roadmap", "Full on-page implementation", "Google Maps optimization", "30-day tracking report"]
      },
      Premium: {
        tier: "Premium",
        name: "Market Leader Authority",
        tagline: "Full-scale SEO campaign to dominate search in your industry",
        price: 29999,
        originalPrice: 42999,
        deliveryDays: 18,
        revisions: "Unlimited",
        features: [
          "35+ pages deep optimization & content re-writing",
          "75+ target keywords tracked with daily telemetry",
          "Technical speed fixes targeting 90+ Mobile Lighthouse score",
          "Strategic internal linking architecture overhaul",
          "Custom content gap roadmap (10 article outlines)",
          "Competitor reverse-engineering and displacement strategy",
          "Bi-weekly strategy call with our senior SEO specialist"
        ],
        deliverables: ["Master SEO Architecture", "Full code implementations", "Live rank tracker dashboard", "60 days priority support"]
      }
    },
    addOns: [
      { id: "seo-gmb-local", name: "Google Maps Local Pack Optimization", description: "Optimize citations, categories, and photos to appear in Top 3 map pack.", price: 3499 },
      { id: "seo-speed-90", name: "Core Web Vitals 90+ Score Guarantee", description: "Dedicated front-end code and script deferral for lightning performance.", price: 6999 },
      { id: "seo-keyword-gap", name: "Competitor Keyword Gap Analysis", description: "Discover the exact terms bringing paying customers to your competitors.", price: 4999 },
      { id: "seo-monthly-tracker", name: "3-Month Rank Tracking & Monthly Reports", description: "Automated ranking telemetry delivered to your email every month.", price: 3999 }
    ],
    comparisonTable: [
      { feature: "Price", basic: "₹5,999", professional: "₹14,999", premium: "₹29,999" },
      { feature: "Pages Optimized", basic: "5 Core Pages", professional: "15 Pages", premium: "35+ Pages" },
      { feature: "Target Keywords", basic: "10 Keywords", professional: "30 Keywords", premium: "75+ Keywords" },
      { feature: "Google Maps / Local SEO", basic: false, professional: true, premium: true },
      { feature: "Schema.org Rich Snippets", basic: "Basic Schema", professional: "FAQ & Local Schema", premium: "Full Custom Entity Graph" },
      { feature: "Core Web Vitals Fixes", basic: "Audit Only", professional: "Guidance Included", premium: "Direct Code Optimization" },
      { feature: "Delivery Timeline", basic: "4 Days", professional: "10 Days", premium: "18 Days" },
      { feature: "Reporting Period", basic: "One-Time Report", professional: "30-Day Checkpoint", premium: "Bi-Weekly Strategy Calls" }
    ]
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    badge: "Fast Results",
    iconName: "Megaphone",
    short: "High-ROI digital ad campaigns, social media growth assets, and lead-generation funnels that bring ready-to-buy customers to your door.",
    description: "Marketing without strategy is just noise. We craft data-backed digital advertising campaigns on Meta (Instagram & Facebook) and Google Ads, paired with high-converting creative assets that turn ad budget into verified customer revenue.",
    startingPrice: 8499,
    category: "Marketing",
    includes: [
      "Meta Ads (Instagram & Facebook) Setup & Optimization",
      "Google Search & Display Advertising",
      "Branded Social Media Ad Creatives",
      "Audience Targeting & Retargeting Funnels",
      "Conversion Pixel & Server-Side Event Tracking",
      "Transparent Weekly Campaign Reporting"
    ],
    benefits: [
      "Target high-intent customers in your exact city, pin code, or industry",
      "Stop wasting ad spend on wrong clicks with negative keyword lists and testing",
      "Scroll-stopping visual creatives designed to stand out in busy social feeds",
      "End-to-end tracking so you know the exact cost per lead and return on ad spend"
    ],
    technologies: ["Meta Ads Manager", "Google Ads", "Meta Pixel / CAPI", "Google Tag Manager", "Canva Pro & Photoshop", "Looker Studio"],
    process: [
      { step: "01", title: "Target Audience Profiling", description: "Defining demographics, interests, behaviors, and buying triggers." },
      { step: "02", title: "Ad Creative Production", description: "Writing hooks, headlines, and designing on-brand static and carousel graphics." },
      { step: "03", title: "Pixel Setup & Launch", description: "Configuring conversion tracking events and launching split tests." },
      { step: "04", title: "Scale & Optimize", description: "Cutting underperforming ad sets and doubling down on winning variations." }
    ],
    packages: {
      Basic: {
        tier: "Basic",
        name: "Campaign Quickstart",
        tagline: "Single-platform ad launch with high-converting creatives",
        price: 8499,
        originalPrice: 11999,
        deliveryDays: 5,
        revisions: 2,
        features: [
          "1 Platform (Meta or Google Ads)",
          "8 custom branded ad creatives & copy variations",
          "Audience targeting & interest research",
          "Conversion pixel / tag manager setup",
          "Campaign launch & 7 days initial monitoring"
        ],
        deliverables: ["Ad accounts configuration", "8 Creative graphics", "Launch report"]
      },
      Professional: {
        tier: "Professional",
        name: "Growth Multi-Channel",
        tagline: "Omnichannel Meta + Google ad funnels with custom retargeting",
        price: 19999,
        originalPrice: 27999,
        deliveryDays: 10,
        revisions: 4,
        popular: true,
        features: [
          "Both Meta (Insta/FB) and Google Ads setup",
          "16 custom ad creatives (Carousels, Statics, Stories)",
          "Custom retargeting funnel (recover abandoned visitors)",
          "A/B split testing of headlines and audiences",
          "WhatsApp lead-gen ad integration (direct chats)",
          "Weekly performance optimization for 30 days"
        ],
        deliverables: ["Full ad campaign setup", "16 Ad assets", "Bi-weekly reporting dashboard", "30 days active management"]
      },
      Premium: {
        tier: "Premium",
        name: "Full-Funnel Domination",
        tagline: "Comprehensive digital acquisition strategy for aggressive growth",
        price: 42999,
        originalPrice: 59999,
        deliveryDays: 18,
        revisions: "Unlimited",
        features: [
          "Meta Ads, Google Search, and YouTube / Display ads",
          "30 custom creatives including 2 short-form video reels",
          "Advanced CAPI server-side tracking (bypasses iOS ad blockers)",
          "Dedicated landing page copy optimization",
          "Competitor ad reverse-engineering",
          "Dedicated campaign strategist with weekly review calls"
        ],
        deliverables: ["Master Creative Suite", "30 Creatives + 2 Videos", "Custom Looker Studio Dashboard", "60 days management"]
      }
    },
    addOns: [
      { id: "dm-video-reel", name: "High-Converting Ad Video Reel", description: "Scripted and edited 30s vertical reel ready for Instagram & TikTok.", price: 4999 },
      { id: "dm-pixel-capi", name: "Meta Conversions API (CAPI) Setup", description: "Server-side tracking setup to recover 25%+ lost attribution from iOS.", price: 2999 },
      { id: "dm-landing-copy", name: "Dedicated Ad Landing Page Copy", description: "Headline, hook, and offer deck designed to maximize click-to-lead rates.", price: 4499 },
      { id: "dm-influencer-deck", name: "Influencer Collaboration Outreach Plan", description: "List of 20 verified regional creators with email outreach scripts.", price: 5999 }
    ],
    comparisonTable: [
      { feature: "Price", basic: "₹8,499", professional: "₹19,999", premium: "₹42,999" },
      { feature: "Platforms Handled", basic: "1 Platform", professional: "Meta + Google", premium: "Meta, Google, YouTube" },
      { feature: "Creative Assets", basic: "8 Creatives", professional: "16 Creatives", premium: "30 Creatives + 2 Videos" },
      { feature: "Retargeting Setup", basic: false, professional: true, premium: true },
      { feature: "Server-Side CAPI", basic: false, professional: "Standard Pixel", premium: "Full Server CAPI" },
      { feature: "Management Period", basic: "7 Days", professional: "30 Days", premium: "60 Days" },
      { feature: "Delivery Timeline", basic: "5 Days", professional: "10 Days", premium: "18 Days" },
      { feature: "Revisions", basic: "2 Rounds", professional: "4 Rounds", premium: "Unlimited" }
    ]
  },
  {
    slug: "web-applications",
    name: "Web Applications",
    badge: "Enterprise Tech",
    iconName: "Layers",
    short: "Bespoke internal software, customer portals, booking engines, and scalable SaaS platforms built to streamline complex operations.",
    description: "When off-the-shelf software doesn't fit your business processes, we engineer custom web applications. Role-based dashboards, secure databases, real-time syncing, and custom automation built on enterprise-grade architecture.",
    startingPrice: 24999,
    featured: true,
    category: "AI & Systems",
    includes: [
      "Custom Business Dashboards & Analytics",
      "Online Appointment & Booking Systems",
      "Role-Based User Authentication & Permissions",
      "PostgreSQL Database Design & Architecture",
      "REST & GraphQL Third-Party API Integrations",
      "Automated PDF Invoicing & CSV Data Exports"
    ],
    benefits: [
      "Eliminate repetitive manual spreadsheets with a unified single-pane portal",
      "Strict data protection with Row Level Security and encrypted session tokens",
      "Tailored specifically around how your team actually works day-to-day",
      "Full code ownership with zero restrictive monthly per-user software licenses"
    ],
    technologies: ["React / TypeScript", "Node.js / Express", "Supabase / PostgreSQL", "Prisma / Drizzle", "Tailwind CSS", "Docker / AWS"],
    process: [
      { step: "01", title: "Architecture & Schema", description: "Designing database entities, relationships, state machines, and permission tiers." },
      { step: "02", title: "Interactive UI & CRUD", description: "Building responsive views, data tables, modals, and input forms with validation." },
      { step: "03", title: "Business Logic & APIs", description: "Implementing authentication, webhooks, invoice generation, and external sync." },
      { step: "04", title: "Stress Testing & Deploy", description: "Load testing queries, securing API endpoints, and production cloud launch." }
    ],
    packages: {
      Basic: {
        tier: "Basic",
        name: "Portal Prototype",
        tagline: "Core internal tool or client portal with essential CRUD capabilities",
        price: 24999,
        originalPrice: 34999,
        deliveryDays: 10,
        revisions: 3,
        features: [
          "Up to 4 custom application screens",
          "Email & password authentication",
          "Relational database setup (up to 5 tables)",
          "Data table with search, sort, and filters",
          "CSV export functionality",
          "Mobile responsive control panel"
        ],
        deliverables: ["Deployed web app", "PostgreSQL database", "30 days bug-fix warranty"]
      },
      Professional: {
        tier: "Professional",
        name: "Business Workflow System",
        tagline: "Comprehensive management system with multi-role permissions and automated notifications",
        price: 54999,
        originalPrice: 74999,
        deliveryDays: 18,
        revisions: 6,
        popular: true,
        features: [
          "Up to 12 responsive application views",
          "Role-based access control (Admin, Manager, Staff, Client)",
          "Interactive dashboard with visual KPI charts",
          "Automated email notifications on status changes",
          "PDF report & invoice generator",
          "Activity audit logs for tracking user actions",
          "Third-party API webhook integration"
        ],
        deliverables: ["Full production codebase", "API documentation", "Admin & team walkthrough call", "60 days support"]
      },
      Premium: {
        tier: "Premium",
        name: "Enterprise Custom SaaS",
        tagline: "Scalable multi-tenant architecture designed for high throughput and complex business rules",
        price: 119999,
        originalPrice: 159999,
        deliveryDays: 30,
        revisions: "Unlimited",
        features: [
          "Unlimited custom views and user journeys",
          "Multi-tenant data isolation & custom domains",
          "Subscription billing & payment gateway webhooks",
          "Real-time websocket notifications & live updates",
          "Comprehensive REST API with rate-limiting and API keys",
          "CI/CD automated deployment pipeline",
          "Automated daily database backups & disaster recovery"
        ],
        deliverables: ["Master Git Repository", "System Architecture Blueprint", "Automated Tests", "90 days Dedicated SLA"]
      }
    },
    addOns: [
      { id: "wa-admin-role", name: "Role-Based Access Control Suite", description: "Fine-grained permissions matrix for Admin, Editor, and Viewer roles.", price: 9999 },
      { id: "wa-pdf-gen", name: "Automated PDF Invoice & Report Engine", description: "Generate beautiful custom branded PDFs with one click.", price: 4999 },
      { id: "wa-realtime-ws", name: "Real-Time WebSocket Updates", description: "Instant live synchronization between multiple active browser tabs.", price: 7999 },
      { id: "wa-api-connector", name: "Third-Party REST API Connector", description: "Connect to external tools like Salesforce, Tally, or custom ERPs.", price: 6499 },
      { id: "wa-csv-export", name: "Advanced Data Export & Import Engine", description: "Bulk import/export with automated validation error highlighting.", price: 2999 }
    ],
    comparisonTable: [
      { feature: "Price", basic: "₹24,999", professional: "₹54,999", premium: "₹1,19,999" },
      { feature: "Application Views", basic: "Up to 4 Views", professional: "Up to 12 Views", premium: "Unlimited Custom Views" },
      { feature: "User Roles", basic: "Single User Role", professional: "4 Distinct Roles", premium: "Custom Multi-Tier RBAC" },
      { feature: "Database Schema", basic: "Up to 5 Tables", professional: "Up to 15 Tables", premium: "Complex Multi-Tenant Architecture" },
      { feature: "Automated Invoicing / PDF", basic: false, professional: true, premium: true },
      { feature: "Real-Time Sync", basic: "Polling", professional: "Webhook Triggers", premium: "Instant WebSockets" },
      { feature: "Subscription / Payments", basic: false, professional: "Single Payment API", premium: "Full Recurring SaaS Billing" },
      { feature: "Delivery Timeline", basic: "10 Days", professional: "18 Days", premium: "30 Days" },
      { feature: "Support Period", basic: "30 Days", professional: "60 Days", premium: "90 Days Dedicated" }
    ]
  }
];

// Portfolio Projects data
export type PortfolioItem = {
  id: string;
  title: string;
  category: "Websites" | "E-commerce" | "UI/UX" | "Web Applications";
  type: "Client Project" | "Verified Showcase";
  description: string;
  technologies: string[];
  metrics: string;
  client: string;
  previewUrl?: string;
  imageUrl: string;
};

export const portfolioItems: PortfolioItem[] = [
  {
    id: "apex-law",
    title: "Apex Corporate Legal Advisors",
    category: "Websites",
    type: "Client Project",
    description: "A prestigious corporate law firm portal built with lightning-fast load times, partner directories, and an encrypted client inquiry system.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Search Optimization"],
    metrics: "+140% Qualified Inquiries in 60 Days",
    client: "Apex Law Partners",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "aurora-luxe",
    title: "Aurora Artisan Home & Decor",
    category: "E-commerce",
    type: "Client Project",
    description: "Direct-to-consumer lifestyle brand store featuring 400+ handmade SKUs, Razorpay checkout, and automated WhatsApp order dispatch alerts.",
    technologies: ["Next.js", "Razorpay SDK", "Supabase", "Tailwind CSS"],
    metrics: "₹18L+ Monthly GMV within 90 days",
    client: "Aurora Living",
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "zenith-health",
    title: "Zenith Health AI Diagnostics",
    category: "UI/UX",
    type: "Verified Showcase",
    description: "Comprehensive multi-platform UI/UX design system and clickable prototype for a clinical radiology and appointment dashboard.",
    technologies: ["Figma", "Design Tokens", "Auto Layout 5.0", "Interactive Prototype"],
    metrics: "4.9/5 User Usability Score Across 30 Clinicians",
    client: "Zenith Diagnostics Lab",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "fleet-flow",
    title: "FleetFlow Logistics & Dispatch",
    category: "Web Applications",
    type: "Client Project",
    description: "Real-time dispatch management system tracking 150+ commercial trucks, driver duty logs, automated fuel expense vouchers, and PDF manifests.",
    technologies: ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
    metrics: "Saved 24 Admin Hours per Week",
    client: "FleetFlow Logistics Ltd.",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "velvet-craft",
    title: "Velvet Couture Designer Boutique",
    category: "E-commerce",
    type: "Client Project",
    description: "High-fashion bridalwear e-commerce boutique with custom measurements input, international currency switching, and instant EMI checkout.",
    technologies: ["React / Vite", "Razorpay", "Tailwind CSS", "Cloudflare"],
    metrics: "3.2x Average Order Value Growth",
    client: "Velvet Fashion Studio",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "kura-saas",
    title: "Kura AI Sales Enablement Platform",
    category: "Web Applications",
    type: "Verified Showcase",
    description: "AI-driven customer relationship dashboard providing automated lead scoring, voice note summaries, and real-time deal stage pipelines.",
    technologies: ["TypeScript", "Gemini API", "Supabase Auth", "Recharts"],
    metrics: "Sub-200ms Global API Response",
    client: "Kura Technology",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
  }
];

// Testimonials data
export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  service: string;
  quote: string;
  rating: number;
  location: string;
};

export const verifiedReviews: Testimonial[] = [
  {
    id: "rev-1",
    name: "Vikramaditya Rao",
    role: "Managing Director",
    company: "Apex Legal Partners",
    service: "Website Development & SEO",
    quote: "WebCraftly gave our firm a website that actually commands respect. Our lead flow tripled within eight weeks of launch, and the speed optimization was impeccable.",
    rating: 5,
    location: "Hyderabad, India"
  },
  {
    id: "rev-2",
    name: "Pooja Sharma",
    role: "Founder & Creative Lead",
    company: "Aurora Living",
    service: "E-commerce Solutions",
    quote: "We were worried about online store setup and Razorpay integration, but WebCraftly delivered ahead of schedule. The WhatsApp order alert system is a customer favorite!",
    rating: 5,
    location: "Bengaluru, India"
  },
  {
    id: "rev-3",
    name: "Arjun Nambiar",
    role: "Chief Operating Officer",
    company: "FleetFlow Logistics",
    service: "Web Applications",
    quote: "The custom dashboard WebCraftly engineered replaced five messy Excel spreadsheets. Our dispatch managers can now oversee 150+ fleet trucks without dropping a single consignment.",
    rating: 5,
    location: "Chennai, India"
  }
];

// FAQ items
export type FAQItem = {
  question: string;
  answer: string;
  category: "General" | "Purchasing" | "Development" | "Payment";
};

export const faqList: FAQItem[] = [
  {
    question: "What services does WebCraftly provide?",
    answer: "WebCraftly is a full-stack digital agency and service marketplace offering eight core services: Website Development, Content Development, UI/UX Design, E-commerce Solutions, AI Integration, SEO Optimization, Digital Marketing, and Custom Web Applications. Each service includes transparent tiers (Basic, Professional, and Premium) with configurable add-ons.",
    category: "General"
  },
  {
    question: "How do I purchase a service on WebCraftly?",
    answer: "Browse our marketplace at /services, pick the service that matches your goals, select the right package (Basic, Professional, or Premium), toggle any optional add-ons, and click 'Add to Cart'. You can review your customized order in the cart, specify your project brief, and complete checkout smoothly.",
    category: "Purchasing"
  },
  {
    question: "What is the difference between Basic, Professional, and Premium packages?",
    answer: "Basic packages are designed for small businesses and individuals who need a fast, affordable launch. Professional packages are our most popular tier, offering extensive feature sets, custom design, and dedicated post-launch support. Premium packages cater to enterprises and high-scale brands requiring bespoke architecture, deep integrations, and unlimited revisions.",
    category: "Purchasing"
  },
  {
    question: "Can I customize my package with optional add-ons?",
    answer: "Yes! Every service has tailored add-ons (such as extra pages, WhatsApp widgets, blog CMS, payment integrations, or express delivery). Our interactive price calculator updates your total in real-time as you toggle add-ons, ensuring complete pricing transparency.",
    category: "Purchasing"
  },
  {
    question: "Can I purchase multiple services together in one single order?",
    answer: "Absolutely. You can add a Website Development package, an SEO Optimization package, and a Content Development package into the same cart. The multi-step checkout will collect requirements for each service seamlessly.",
    category: "Purchasing"
  },
  {
    question: "How long does website or application development take?",
    answer: "Timelines depend on the service and chosen package: Starter sites typically take 4-7 business days, Professional packages take 8-14 business days, and complex Enterprise Web Applications take 18-30 business days. We provide express delivery add-ons when urgent turnarounds are required.",
    category: "Development"
  },
  {
    question: "Can I request a custom quote instead of a fixed package?",
    answer: "Yes! If your project has unique specifications or custom enterprise requirements, visit our Custom Quote page (/custom-quote) to submit your project details. We will review your brief and provide a tailored proposal within 24 hours.",
    category: "Purchasing"
  },
  {
    question: "What payment methods are accepted?",
    answer: "We support secure payments in Indian Rupees (₹) via UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards, and Netbanking via Razorpay. Direct bank wire / NEFT transfer details are also provided for corporate orders.",
    category: "Payment"
  },
  {
    question: "How can I track my project order after purchasing?",
    answer: "Every order generates a unique Order ID (e.g. WC-2026-XXXXX). You can visit the Order Tracking page (/orders) or your Customer Dashboard (/account) to view real-time status updates: Pending, Confirmed, In Progress, Under Review, and Completed.",
    category: "Development"
  },
  {
    question: "Do you provide maintenance and post-launch support?",
    answer: "Yes! All packages include complimentary post-launch support (ranging from 14 to 90 days depending on the tier). We also offer annual maintenance, security monitoring, and regular backups through our optional add-ons.",
    category: "General"
  }
];

// Cart Data Model & LocalStorage Handlers
export type CartAddonSelection = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  id: string;
  serviceSlug: string;
  serviceName: string;
  packageName: PackageTier;
  packagePrice: number;
  addOns: CartAddonSelection[];
  notes: string;
  totalPrice: number;
};

export const cartStorageKey = "webcraftly_cart_store_v2";
export const ordersStorageKey = "webcraftly_orders_store_v2";
export const inquiriesStorageKey = "webcraftly_inquiries_store_v2";
export const customerProfileStorageKey = "webcraftly_customer_session_v2";

export function parseCart(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
    window.dispatchEvent(new Event("webcraftly-cart-change"));
  }
}

export function addToCart(item: Omit<CartItem, "id" | "totalPrice">): CartItem {
  const existing = parseCart(typeof window !== "undefined" ? window.localStorage.getItem(cartStorageKey) : null);
  const addonsTotal = item.addOns.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = item.packagePrice + addonsTotal;
  
  // Check if identical item already exists (same service, package, addons, notes)
  const sortedAddonIds = item.addOns.map((a) => a.id).sort().join(",");
  const match = existing.find(
    (e) =>
      e.serviceSlug === item.serviceSlug &&
      e.packageName === item.packageName &&
      e.addOns.map((a) => a.id).sort().join(",") === sortedAddonIds &&
      e.notes === item.notes
  );

  if (match) {
    return match;
  }

  const newItem: CartItem = {
    ...item,
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    totalPrice
  };

  const updated = [...existing, newItem];
  saveCart(updated);
  return newItem;
}

export function removeFromCart(itemId: string): void {
  const existing = parseCart(typeof window !== "undefined" ? window.localStorage.getItem(cartStorageKey) : null);
  saveCart(existing.filter((item) => item.id !== itemId));
}

export function clearCart(): void {
  saveCart([]);
}

// Order Management Data Model
export type OrderStatus = "Pending" | "Confirmed" | "In Progress" | "Under Review" | "Completed" | "Cancelled";

export type Order = {
  id: string; // e.g., WC-2026-84920
  createdAt: string;
  status: OrderStatus;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    businessName?: string;
  };
  requirements: {
    projectDescription: string;
    referenceUrl?: string;
    requiredFeatures?: string;
    specialInstructions?: string;
    deliveryTimeline?: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "razorpay" | "upi_transfer" | "bank_wire" | "custom_invoice";
  paymentStatus: "Verified" | "Awaiting Verification" | "Invoice Sent";
  paymentReference?: string;
};

export function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ordersStorageKey);
    if (!raw) return getInitialDemoOrders();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getInitialDemoOrders();
  } catch {
    return getInitialDemoOrders();
  }
}

export function saveOrder(order: Order): void {
  if (typeof window === "undefined") return;
  const current = getStoredOrders();
  const updated = [order, ...current.filter((o) => o.id !== order.id)];
  window.localStorage.setItem(ordersStorageKey, JSON.stringify(updated));
  window.dispatchEvent(new Event("webcraftly-orders-change"));
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
  const current = getStoredOrders();
  const updated = current.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
  window.localStorage.setItem(ordersStorageKey, JSON.stringify(updated));
  window.dispatchEvent(new Event("webcraftly-orders-change"));
}

// Initial demo order for customer tracking test
function getInitialDemoOrders(): Order[] {
  return [
    {
      id: "WC-2026-84920",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: "In Progress",
      customer: {
        fullName: "Siddharth Verma",
        email: "siddharth@example.com",
        phone: "+91 98765 43210",
        businessName: "Verma Tech Consulting"
      },
      requirements: {
        projectDescription: "High-performance website with custom lead capture forms and corporate branding.",
        referenceUrl: "https://webcraftly.agency",
        requiredFeatures: "WhatsApp floating widget, blog CMS, search engine indexing",
        deliveryTimeline: "Standard (10 Days)"
      },
      items: [
        {
          id: "item-demo-1",
          serviceSlug: "website-development",
          serviceName: "Website Development",
          packageName: "Professional",
          packagePrice: 24999,
          addOns: [
            { id: "wd-blog-cms", name: "Full Blog / News CMS", price: 4999 },
            { id: "wd-whatsapp-widget", name: "Direct WhatsApp & Call Widget", price: 1299 }
          ],
          notes: "Need dark/navy accents on header matching corporate colors.",
          totalPrice: 31297
        }
      ],
      subtotal: 31297,
      discount: 0,
      total: 31297,
      paymentMethod: "upi_transfer",
      paymentStatus: "Verified",
      paymentReference: "UPI-TXN-9840219"
    }
  ];
}

// Custom Quote Inquiry Model
export type CustomQuoteInquiry = {
  id: string; // e.g. INQ-94812
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  businessName?: string | undefined;
  requiredService: string;
  budget: string;
  timeline: string;
  projectDescription: string;
  referenceUrl?: string | undefined;
  additionalRequirements?: string | undefined;
  status: "New" | "Reviewed" | "Proposal Sent" | "Closed";
};

export function getStoredInquiries(): CustomQuoteInquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(inquiriesStorageKey);
    if (!raw) return getInitialDemoInquiries();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getInitialDemoInquiries();
  } catch {
    return getInitialDemoInquiries();
  }
}

export function saveInquiry(inquiry: CustomQuoteInquiry): void {
  if (typeof window === "undefined") return;
  const current = getStoredInquiries();
  const updated = [inquiry, ...current.filter((i) => i.id !== inquiry.id)];
  window.localStorage.setItem(inquiriesStorageKey, JSON.stringify(updated));
  window.dispatchEvent(new Event("webcraftly-inquiries-change"));
}

function getInitialDemoInquiries(): CustomQuoteInquiry[] {
  return [
    {
      id: "INQ-94812",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      fullName: "Kavita Reddy",
      email: "kavita.reddy@aurapharma.in",
      phone: "+91 94401 23456",
      businessName: "Aura Pharma Pvt Ltd",
      requiredService: "Web Applications",
      budget: "₹50,000 - ₹1,00,000",
      timeline: "Within 3 weeks",
      projectDescription: "Need an internal batch testing log portal for chemical quality analysts with role-based sign-offs and PDF certificate generation.",
      referenceUrl: "https://example.com/spec",
      additionalRequirements: "Must export to Excel and integrate with local intranet database.",
      status: "New"
    }
  ];
}

// Currency format helper
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}
