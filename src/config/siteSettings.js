// Site-wide settings for Pubble Plastering
export const siteSettings = {
  // Company Information
  company: {
    name: "Pubble Plastering",
    tagline: "Professional Plastering & Construction Services",
    description:
      "Expert plastering, rendering, and wall repair services across the UK. Quality workmanship with over 15 years of experience.",
    email: "info@pubbleplastering.co.uk",
    phone: "+44 123 456 7890",
    mobile: "+44 7123 456 789",
    address: {
      street: "123 Construction Lane",
      city: "London",
      county: "Greater London",
      postcode: "SW1A 1AA",
      country: "United Kingdom",
    },
    businessHours: {
      weekdays: "7:00 AM - 6:00 PM",
      saturday: "8:00 AM - 4:00 PM",
      sunday: "Closed",
    },
    vatNumber: "GB123456789",
    companyNumber: "12345678",
  },

  // Social Media Links
  social: {
    facebook: "https://facebook.com/pubbleplastering",
    instagram: "https://instagram.com/pubbleplastering",
    twitter: "https://twitter.com/pubbleplaster",
    linkedin: "https://linkedin.com/company/pubble-plastering",
    youtube: "https://youtube.com/@pubbleplastering",
  },

  // SEO Default Settings
  seo: {
    defaultTitle: "Pubble Plastering | Professional Plastering Services UK",
    titleTemplate: "%s | Pubble Plastering",
    defaultDescription:
      "Expert plastering, rendering, and wall repair services. Professional workmanship, competitive prices. Get your free quote today!",
    siteUrl: "https://pubbleplastering.co.uk",
    defaultImage: "/images/og-default.jpg",
    twitterHandle: "@pubbleplaster",
  },

  // Blog Categories
  blogCategories: [
    {
      id: "plastering-tips",
      name: "Plastering Tips & Advice",
      slug: "plastering-tips-advice",
    },
    {
      id: "before-after",
      name: "Before and After Projects",
      slug: "before-after-projects",
    },
    {
      id: "renovation-guides",
      name: "Renovation Guides",
      slug: "renovation-guides",
    },
    {
      id: "wall-problems",
      name: "Common Wall Problems & Fixes",
      slug: "wall-problems-fixes",
    },
    {
      id: "construction-trends",
      name: "Construction Trends",
      slug: "construction-trends",
    },
    {
      id: "diy-vs-professional",
      name: "DIY vs Professional Work",
      slug: "diy-vs-professional",
    },
  ],

  // Services Offered
  services: [
    {
      id: "plastering",
      name: "Plastering",
      description: "Professional interior and exterior plastering services",
      icon: "trowel",
    },
    {
      id: "rendering",
      name: "Rendering",
      description: "External wall rendering and finishing",
      icon: "wall",
    },
    {
      id: "skimming",
      name: "Skimming",
      description: "Smooth wall finishing and re-skimming",
      icon: "smooth",
    },
    {
      id: "dry-lining",
      name: "Dry Lining",
      description: "Plasterboard installation and finishing",
      icon: "board",
    },
    {
      id: "coving",
      name: "Coving & Cornices",
      description: "Decorative coving and cornice installation",
      icon: "coving",
    },
    {
      id: "repairs",
      name: "Wall Repairs",
      description: "Crack repairs, hole filling, and restoration",
      icon: "repair",
    },
  ],

  // Project Statuses
  projectStatuses: [
    { id: "planned", name: "Planned", color: "blue" },
    { id: "ongoing", name: "Ongoing", color: "yellow" },
    { id: "completed", name: "Completed", color: "green" },
    { id: "on-hold", name: "On Hold", color: "gray" },
  ],

  // Payment Methods
  paymentMethods: [
    { id: "bank-transfer", name: "Bank Transfer" },
    { id: "cash", name: "Cash" },
    { id: "card", name: "Card" },
    { id: "paypal", name: "PayPal" },
  ],

  // VAT Settings
  vat: {
    enabled: true,
    rate: 20, // UK VAT rate
  },

  // Receipt/Invoice Prefixes
  documentPrefixes: {
    invoice: "PP-INV-",
    receipt: "PP-REC-",
    quote: "PP-QT-",
  },

  // Upload Settings
  uploads: {
    maxFileSizeMB: 10,
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedDocumentTypes: ["application/pdf"],
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
    enableTracking: process.env.NODE_ENV === "production",
  },

  // reCAPTCHA
  recaptcha: {
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
    secretKey: process.env.RECAPTCHA_SECRET_KEY || "",
  },

  // Wall Problems for Interactive Tool
  wallProblems: [
    {
      id: "cracks",
      name: "Cracks",
      description: "Visible cracks in the wall surface",
      suggestedArticles: [
        "how-to-fix-cracked-plaster-walls",
        "types-of-wall-cracks",
      ],
      suggestedServices: ["repairs", "plastering"],
    },
    {
      id: "damp",
      name: "Damp",
      description: "Moisture or water damage on walls",
      suggestedArticles: ["dealing-with-damp-walls", "damp-proofing-guide"],
      suggestedServices: ["repairs", "rendering"],
    },
    {
      id: "holes",
      name: "Holes",
      description: "Small or large holes in the wall",
      suggestedArticles: [
        "patching-holes-in-plaster",
        "wall-hole-repair-guide",
      ],
      suggestedServices: ["repairs", "plastering"],
    },
    {
      id: "peeling",
      name: "Peeling Plaster",
      description: "Plaster falling off or peeling away",
      suggestedArticles: ["why-plaster-peels", "re-plastering-walls"],
      suggestedServices: ["plastering", "skimming"],
    },
    {
      id: "uneven",
      name: "Uneven Surface",
      description: "Bumpy or uneven wall surfaces",
      suggestedArticles: ["leveling-uneven-walls", "skim-coat-guide"],
      suggestedServices: ["skimming", "plastering"],
    },
  ],

  // Cost Estimator Base Rates (GBP per square meter)
  costEstimator: {
    plasterTypes: [
      { id: "standard", name: "Standard Plaster", pricePerSqm: 15 },
      { id: "skim", name: "Skim Coat", pricePerSqm: 12 },
      { id: "bonding", name: "Bonding Plaster", pricePerSqm: 18 },
      { id: "multifinish", name: "Multi-Finish", pricePerSqm: 16 },
      { id: "render", name: "External Render", pricePerSqm: 25 },
    ],
    laborRate: 180, // per day
    minimumCharge: 250,
  },
};

export default siteSettings;
