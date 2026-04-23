/**
 * Schema.org JSON-LD generators for SEO.
 * Use these to add structured data to landing pages.
 */

const ORG_BASE = {
  "@type": "Organization",
  name: "كلميرون",
  alternateName: "Kalmeron",
  url: "https://kalmeron.com",
  logo: "https://kalmeron.com/icon.png",
  sameAs: [
    "https://twitter.com/kalmeron",
    "https://linkedin.com/company/kalmeron",
  ],
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    ...ORG_BASE,
    description:
      "نظام تشغيل الذكاء الاصطناعي لرواد الأعمال العرب: وكلاء متخصصون في المالية والقانون والتسويق والعمليات.",
    foundingDate: "2025",
    address: {
      "@type": "PostalAddress",
      addressCountry: "EG",
      addressLocality: "Cairo",
    },
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "كلميرون",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1247",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  authorName: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
  modifiedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    author: { "@type": "Person", name: opts.authorName },
    publisher: ORG_BASE,
    datePublished: opts.publishedAt,
    dateModified: opts.modifiedAt || opts.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
    image: opts.imageUrl ? [opts.imageUrl] : undefined,
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  totalTimeMinutes: number;
  steps: { title: string; description: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    totalTime: `PT${opts.totalTimeMinutes}M`,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
    })),
  };
}

export function productSchema(opts: {
  name: string;
  description: string;
  price: number;
  priceCurrency: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    offers: {
      "@type": "Offer",
      price: opts.price.toString(),
      priceCurrency: opts.priceCurrency,
      url: opts.url,
      availability: "https://schema.org/InStock",
    },
  };
}

export function definedTermSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "قاموس كلميرون لرواد الأعمال",
      url: "https://kalmeron.com/glossary",
    },
  };
}

export function localBusinessSchema(opts: {
  name: string;
  city: string;
  country: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: opts.name,
    description: opts.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: opts.city,
      addressCountry: opts.country,
    },
  };
}
