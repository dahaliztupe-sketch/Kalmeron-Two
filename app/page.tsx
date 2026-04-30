import PageClient from "./_page-client";

// Homepage intentionally inherits its <title> and <meta name="description">
// from the root `generateMetadata` in app/layout.tsx. Defining a placeholder
// `metadata` here would clobber the SEO-tuned Arabic description (>100 chars,
// validated by e2e/landing.spec.ts) with a generic 28-char string.

export default function Page() {
  return <PageClient />;
}
